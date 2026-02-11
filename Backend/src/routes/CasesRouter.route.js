import express from 'express';
import Case from '../models/Case.js';
import Novedad from '../models/Novedad.js';
import Evidencia from '../models/Evidencia.js';
import upload from '../config/multer.js';
import uploadEvidencias from '../config/multer-evidencias.js';
import ExcelService from '../services/Excel.service.js';
import { uploadFileToStorage, getSignedUrl } from '../services/Storage.service.js';

const router = express.Router();

// Obtener todos los casos
router.get('/', async (req, res) => {
  try {
    const cases = await Case.getAllCases();
    res.status(200).json(cases);
  } catch (error) {
    const msg = error?.message || 'Error al obtener los casos';
    res.status(500).json({ message: msg });
  }
});

// Crear caso
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const aviso = body.aviso != null ? String(body.aviso).trim() : '';
    if (!aviso) {
      return res.status(400).json({
        message: 'El aviso es obligatorio',
      });
    }
    const avisoNum = Number(aviso);
    if (!Number.isInteger(avisoNum) || avisoNum < 0) {
      return res.status(400).json({
        message: 'El aviso debe ser un número entero mayor o igual a 0',
      });
    }
    const { data } = await Case.createCase({ ...body, aviso });
    res.status(201).json({
      message: 'Caso creado correctamente',
      case: data,
    });
  } catch (error) {
    const msg = error?.message || 'Error al crear el caso';
    const status = (msg.includes('duplicate') || msg.includes('unique') || msg.includes('aviso')) ? 409 : 500;
    res.status(status).json({ message: msg });
  }
});

// Importar casos desde Excel
router.post('/import', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Error de multer (tipo de archivo inválido, tamaño excedido, etc.)
      console.error('Error de multer:', err.message);
      return res.status(400).json({
        message: err.message || 'Error al procesar el archivo',
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No se proporcionó ningún archivo',
      });
    }

    const result = await ExcelService.importCasesFromExcel(req.file.buffer);

    // Determinar el código de estado según los resultados
    let statusCode = 200;
    if (result.errors.length > 0 && result.success.length === 0) {
      statusCode = 400; // Solo errores
    } else if (result.errors.length > 0 && result.success.length > 0) {
      statusCode = 207; // Multi-Status: algunos exitosos, algunos con errores
    }

    // Contar casos actualizados vs creados
    const created = result.success.filter(s => !s.updated).length;
    const updated = result.success.filter(s => s.updated).length;
    
    let message = `Importación completada: ${created} casos creados`;
    if (updated > 0) {
      message += `, ${updated} casos actualizados`;
    }
    if (result.skipped > 0) {
      message += `, ${result.skipped} casos omitidos (sin cambios)`;
    }
    if (result.errors.length > 0) {
      message += `, ${result.errors.length} errores`;
    }
    
    res.status(statusCode).json({
      message: message,
      summary: {
        totalRows: result.totalRows,
        validCasesFound: result.validCasesFound,
        created: created,
        updated: updated,
        success: result.success.length,
        skipped: result.skipped,
        errors: result.errors.length,
      },
      success: result.success,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Error en importación:', error);
    const msg = error?.message || 'Error al importar los casos';
    res.status(500).json({ message: msg });
  }
});

// Obtener todas las novedades de un caso
router.get('/:id/novedades', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: 'El ID del caso es obligatorio',
      });
    }
    const novedades = await Novedad.getNovedadesByCasoId(id);
    res.status(200).json(novedades);
  } catch (error) {
    const msg = error?.message || 'Error al obtener las novedades';
    res.status(500).json({ message: msg });
  }
});

// Crear una novedad para un caso
router.post('/:id/novedades', async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body || {};
    
    if (!id) {
      return res.status(400).json({
        message: 'El ID del caso es obligatorio',
      });
    }
    
    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({
        message: 'El texto de la novedad es obligatorio',
      });
    }

    const { data } = await Novedad.createNovedad(id, texto);
    res.status(201).json({
      message: 'Novedad creada correctamente',
      novedad: data,
    });
  } catch (error) {
    const msg = error?.message || 'Error al crear la novedad';
    const status = msg.includes('no existe') ? 404 : 500;
    res.status(status).json({ message: msg });
  }
});

// Obtener todas las evidencias de un caso
router.get('/:id/evidencias', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: 'El ID del caso es obligatorio',
      });
    }
    const evidencias = await Evidencia.getEvidenciasByCasoId(id);
    
    // Generar URLs firmadas para cada evidencia
    const evidenciasConUrl = await Promise.all(
      evidencias.map(async (evidencia) => {
        try {
          const signedUrl = await getSignedUrl(evidencia.ruta_storage, 3600); // 1 hora de validez
          return {
            ...evidencia,
            url: signedUrl,
          };
        } catch (error) {
          console.error(`Error al generar URL para evidencia ${evidencia.id}:`, error);
          return {
            ...evidencia,
            url: null,
          };
        }
      })
    );
    
    res.status(200).json(evidenciasConUrl);
  } catch (error) {
    const msg = error?.message || 'Error al obtener las evidencias';
    res.status(500).json({ message: msg });
  }
});

// Obtener URL firmada de una evidencia específica
router.get('/evidencias/:evidenciaId/url', async (req, res) => {
  try {
    const { evidenciaId } = req.params;
    const { expiresIn = 3600 } = req.query; // Default: 1 hora
    
    if (!evidenciaId) {
      return res.status(400).json({
        message: 'El ID de la evidencia es obligatorio',
      });
    }

    // Obtener la evidencia para obtener la ruta
    const evidencia = await Evidencia.getEvidenciaById(evidenciaId);
    if (!evidencia) {
      return res.status(404).json({
        message: 'Evidencia no encontrada',
      });
    }

    const signedUrl = await getSignedUrl(evidencia.ruta_storage, parseInt(expiresIn));
    
    res.status(200).json({
      url: signedUrl,
      expiresIn: parseInt(expiresIn),
    });
  } catch (error) {
    const msg = error?.message || 'Error al generar URL firmada';
    res.status(500).json({ message: msg });
  }
});

// Subir una evidencia para un caso
router.post('/:id/evidencias', (req, res, next) => {
  uploadEvidencias.single('file')(req, res, (err) => {
    if (err) {
      console.error('Error de multer:', err.message);
      return res.status(400).json({
        message: err.message || 'Error al procesar el archivo',
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        message: 'El ID del caso es obligatorio',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'No se proporcionó ningún archivo',
      });
    }

    // Subir archivo a Supabase Storage
    const storageResult = await uploadFileToStorage(
      req.file.buffer,
      req.file.originalname,
      id
    );

    // Crear registro en la base de datos
    const { data } = await Evidencia.createEvidencia(id, {
      nombre_archivo: req.file.originalname,
      tipo_archivo: storageResult.tipoArchivo,
      ruta_storage: storageResult.ruta,
      tamaño_bytes: req.file.size,
      mime_type: storageResult.mimeType,
    });

    res.status(201).json({
      message: 'Evidencia subida correctamente',
      evidencia: data,
    });
  } catch (error) {
    const msg = error?.message || 'Error al subir la evidencia';
    const status = msg.includes('no existe') ? 404 : 500;
    res.status(status).json({ message: msg });
  }
});

// Eliminar una evidencia
router.delete('/evidencias/:evidenciaId', async (req, res) => {
  try {
    const { evidenciaId } = req.params;
    
    if (!evidenciaId) {
      return res.status(400).json({
        message: 'El ID de la evidencia es obligatorio',
      });
    }

    await Evidencia.deleteEvidencia(evidenciaId);
    
    res.status(200).json({
      message: 'Evidencia eliminada correctamente',
    });
  } catch (error) {
    const msg = error?.message || 'Error al eliminar la evidencia';
    const status = msg.includes('no encontrada') ? 404 : 500;
    res.status(status).json({ message: msg });
  }
});

// Actualizar un caso por ID
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    
    if (!id) {
      return res.status(400).json({
        message: 'El ID es obligatorio',
      });
    }

    // Obtener el caso para obtener el aviso
    const existingCase = await Case.getCaseById(id);
    if (!existingCase) {
      return res.status(404).json({
        message: 'Caso no encontrado',
      });
    }

    // Actualizar usando el aviso
    const { data } = await Case.updateCase(existingCase.aviso, body);
    
    res.status(200).json({
      message: 'Caso actualizado correctamente',
      case: data,
    });
  } catch (error) {
    const msg = error?.message || 'Error al actualizar el caso';
    res.status(500).json({ message: msg });
  }
});

// Obtener un caso por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: 'El ID es obligatorio',
      });
    }
    const caseData = await Case.getCaseById(id);
    if (!caseData) {
      return res.status(404).json({
        message: 'Caso no encontrado',
      });
    }
    res.status(200).json(caseData);
  } catch (error) {
    const msg = error?.message || 'Error al obtener el caso';
    res.status(500).json({ message: msg });
  }
});

export default router;
