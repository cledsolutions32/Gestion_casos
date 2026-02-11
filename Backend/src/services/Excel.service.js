import * as XLSX from 'xlsx';
import Case from '../models/Case.js';

// Zonas permitidas para importar (con variaciones de nombres)
const ALLOWED_ZONES = new Set([
  'Zona Bogotá',
  'Zona Bogota',
  'Zona Ibague centro',
  'Zona Ibagué Centro',
  'Zona Ibagué centro',
  'Zona oriental',
  'Zona Oriental',
  'Zona Santander',
  'Zona Santanderes',
]);

// Mapeo de columnas del Excel a campos de Supabase
const COLUMN_MAPPING = {
  'Aviso': 'aviso',
  'Texto Breve': 'texto_breve',
  'Tipologia': 'tipologia',
  'Prioridad': 'prioridad',
  'zona': 'zona',
  'ubicación': 'ubicacion',
  'Fecha Creado': 'fecha_creacion',
  'Fin Avería con tiempo de respuesta': 'fin_averia_tiempo_respuesta',
};

/**
 * Normaliza el nombre de una columna eliminando espacios extra, saltos de línea y convirtiendo a minúsculas para comparación
 */
function normalizeColumnName(name) {
  if (!name || typeof name !== 'string') return '';
  // Eliminar saltos de línea (\r\n, \n, \r), espacios múltiples y convertir a minúsculas
  return name
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
    .trim()
    .toLowerCase();
}

/**
 * Encuentra el índice de una columna en el header basándose en el nombre normalizado
 */
function findColumnIndex(headerRow, columnName) {
  const normalizedTarget = normalizeColumnName(columnName);
  for (let i = 0; i < headerRow.length; i++) {
    if (normalizeColumnName(headerRow[i]) === normalizedTarget) {
      return i;
    }
  }
  return -1;
}

/**
 * Convierte una fecha de Excel a formato YYYY-MM-DD
 */
function excelDateToDateString(excelDate) {
  if (!excelDate) return null;
  
  // Si ya es una cadena en formato fecha, intentar parsearla
  if (typeof excelDate === 'string') {
    // Intentar parsear diferentes formatos de fecha
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // Si es formato YYYY-MM-DD, retornarlo tal cual
    if (/^\d{4}-\d{2}-\d{2}/.test(excelDate)) {
      return excelDate.split('T')[0]; // Tomar solo la parte de fecha si hay hora
    }
    return null;
  }
  
  // Si es un número (serial de Excel), convertirlo
  if (typeof excelDate === 'number') {
    // Excel cuenta días desde el 1 de enero de 1900
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

/**
 * Procesa un archivo Excel y extrae los casos válidos
 */
function processExcelFile(buffer) {
  try {
    // Leer el archivo Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON con encabezados en la primera fila
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, // Usar array de arrays en lugar de objetos
      defval: null, // Valores por defecto null
      raw: false, // Convertir fechas y números a strings
    });
    
    if (data.length < 2) {
      throw new Error('El archivo Excel debe tener al menos una fila de encabezados y una fila de datos');
    }
    
    // La primera fila son los encabezados
    const headerRow = data[0];
    
    // Encontrar los índices de las columnas necesarias
    const columnIndices = {};
    const missingColumns = [];
    for (const [excelColumn, dbColumn] of Object.entries(COLUMN_MAPPING)) {
      const index = findColumnIndex(headerRow, excelColumn);
      if (index === -1) {
        missingColumns.push(excelColumn);
      } else {
        columnIndices[dbColumn] = index;
      }
    }
    
    // Si faltan columnas críticas, lanzar error con información útil
    if (missingColumns.length > 0) {
      const availableColumns = headerRow.filter(h => h != null).map((h, i) => `"${h}" (índice ${i})`).join(', ');
      throw new Error(
        `No se encontraron las siguientes columnas requeridas: ${missingColumns.join(', ')}. ` +
        `Columnas disponibles en el archivo: ${availableColumns || 'ninguna'}`
      );
    }
    
    // Procesar las filas de datos (empezando desde la fila 2)
    const validCases = [];
    const errors = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Saltar filas vacías
      if (!row || row.every(cell => cell === null || cell === '' || (typeof cell === 'string' && !cell.trim()))) {
        continue;
      }
      
      try {
        // Extraer los valores de las columnas
        const caseData = {};
        
        // Aviso (obligatorio)
        const avisoValue = row[columnIndices.aviso];
        if (!avisoValue && avisoValue !== 0) {
          errors.push(`Fila ${i + 1}: El aviso es obligatorio`);
          continue;
        }
        caseData.aviso = String(avisoValue).trim();
        
        // Validar que el aviso sea un número válido
        if (!/^\d+$/.test(caseData.aviso)) {
          errors.push(`Fila ${i + 1}: El aviso debe ser un número entero válido (valor: "${caseData.aviso}")`);
          continue;
        }
        
        // Zona (obligatorio para filtrar)
        const zonaValue = row[columnIndices.zona];
        if (!zonaValue) {
          errors.push(`Fila ${i + 1}: La zona es obligatoria (valor vacío o nulo)`);
          continue;
        }
        let zona = String(zonaValue).trim();
        
        if (!zona) {
          errors.push(`Fila ${i + 1}: La zona es obligatoria (valor vacío después de trim)`);
          continue;
        }
        
        // Normalizar nombre de zona para comparación (case-insensitive)
        const zonaNormalized = zona.toLowerCase();
        let zonaMatch = null;
        for (const allowedZone of ALLOWED_ZONES) {
          if (allowedZone.toLowerCase() === zonaNormalized) {
            zonaMatch = allowedZone;
            break;
          }
        }
        
        // Filtrar solo las zonas permitidas
        if (!zonaMatch) {
          errors.push(`Fila ${i + 1}: Zona "${zona}" no está en la lista de zonas permitidas. Zonas permitidas: ${Array.from(ALLOWED_ZONES).slice(0, 4).join(', ')}`);
          continue;
        }
        
        // Usar el nombre normalizado de la zona permitida
        // Mapear a los nombres estándar que se usan en el sistema (como en el formulario)
        if (zonaNormalized.includes('bogotá') || zonaNormalized.includes('bogota')) {
          caseData.zona = 'Zona Bogotá';
        } else if (zonaNormalized.includes('ibagué') || zonaNormalized.includes('ibague')) {
          caseData.zona = 'Zona Ibagué Centro';
        } else if (zonaNormalized.includes('oriental')) {
          caseData.zona = 'Zona Oriental';
        } else if (zonaNormalized.includes('santander')) {
          caseData.zona = 'Zona Santanderes';
        } else {
          // Si coincide exactamente con alguno de los permitidos, usarlo tal cual
          caseData.zona = zonaMatch;
        }
        
        // Texto Breve
        if (row[columnIndices.texto_breve]) {
          caseData.texto_breve = String(row[columnIndices.texto_breve]).trim();
        }
        
        // Tipologia
        if (row[columnIndices.tipologia]) {
          caseData.tipologia = String(row[columnIndices.tipologia]).trim();
        }
        
        // Prioridad
        if (row[columnIndices.prioridad]) {
          caseData.prioridad = String(row[columnIndices.prioridad]).trim();
        }
        
        // Ubicación
        if (row[columnIndices.ubicacion]) {
          const ubicacionValue = String(row[columnIndices.ubicacion]).trim();
          
          // Extraer los últimos 4 dígitos del código
          // Puede venir como "VT-1008-5249" o solo "5249"
          const digitos = ubicacionValue.match(/\d+/g);
          if (digitos && digitos.length > 0) {
            // Tomar el último grupo de dígitos y extraer los últimos 4
            const ultimoGrupo = digitos[digitos.length - 1];
            caseData.ubicacion = ultimoGrupo.slice(-4);
          } else {
            // Si no hay dígitos, usar el valor completo
            caseData.ubicacion = ubicacionValue;
          }
        }
        
        // Fecha Creado
        if (row[columnIndices.fecha_creacion]) {
          const fechaStr = excelDateToDateString(row[columnIndices.fecha_creacion]);
          if (fechaStr) {
            caseData.fecha_creacion = fechaStr;
          }
        }
        
        // Fin Avería con tiempo de respuesta
        if (row[columnIndices.fin_averia_tiempo_respuesta]) {
          const fechaStr = excelDateToDateString(row[columnIndices.fin_averia_tiempo_respuesta]);
          if (fechaStr) {
            caseData.fin_averia_tiempo_respuesta = fechaStr;
          }
        }
        
        // Estado por defecto: "Abierto"
        caseData.estado = 'Abierto';
        
        validCases.push(caseData);
      } catch (error) {
        errors.push(`Fila ${i + 1}: ${error.message || 'Error al procesar la fila'}`);
      }
    }
    
    return {
      cases: validCases,
      errors: errors,
      totalRows: data.length - 1, // Excluyendo el header
    };
  } catch (error) {
    throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
  }
}

/**
 * Importa casos desde un archivo Excel
 */
async function importCasesFromExcel(buffer) {
  const { cases, errors, totalRows } = processExcelFile(buffer);
  
  const results = {
    success: [],
    errors: [...errors],
    skipped: 0,
    totalProcessed: 0,
  };
  
  // Intentar crear cada caso
  for (const caseData of cases) {
    try {
      const { data } = await Case.createCase(caseData);
      results.success.push({
        aviso: caseData.aviso,
        data: data,
      });
      results.totalProcessed++;
    } catch (error) {
      // Si el error es por duplicado, verificar si hay cambios
      if (error.message && (error.message.includes('duplicate') || error.message.includes('unique') || error.message.includes('aviso'))) {
        try {
          // Obtener el caso existente
          const existingCase = await Case.getCaseByAviso(caseData.aviso);
          
          if (existingCase) {
            // Comparar casos para detectar cambios
            const changes = Case.compareCases(existingCase, caseData);
            
            if (Object.keys(changes).length > 0) {
              // Hay cambios, actualizar el caso
              const { data: updatedData } = await Case.updateCase(caseData.aviso, caseData);
              results.success.push({
                aviso: caseData.aviso,
                data: updatedData,
                updated: true,
                changes: changes,
              });
              results.totalProcessed++;
            } else {
              // No hay cambios, contar como skipped
              results.skipped++;
              results.errors.push(`Aviso ${caseData.aviso}: Ya existe en la base de datos (sin cambios)`);
            }
          } else {
            // No se encontró el caso (caso raro), contar como skipped
            results.skipped++;
            results.errors.push(`Aviso ${caseData.aviso}: Ya existe en la base de datos`);
          }
        } catch (updateError) {
          // Error al actualizar, agregar a errores
          console.error(`Error al actualizar caso ${caseData.aviso}:`, updateError.message);
          results.errors.push(`Aviso ${caseData.aviso}: Error al actualizar - ${updateError.message || 'Error desconocido'}`);
        }
      } else {
        console.error(`Error al crear caso ${caseData.aviso}:`, error.message);
        results.errors.push(`Aviso ${caseData.aviso}: ${error.message || 'Error al crear el caso'}`);
      }
    }
  }
  
  return {
    ...results,
    totalRows: totalRows,
    validCasesFound: cases.length,
  };
}

export default {
  importCasesFromExcel,
  processExcelFile,
};
