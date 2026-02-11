import supabase from '../config/db.js';

/** Campos permitidos para insertar en la tabla casos (evita inyección de columnas) */
const ALLOWED_KEYS = new Set([
  'aviso', 'fecha_creacion', 'tipologia',
  'texto_breve', 'zona', 'ubicacion', 'denominacion_ubicacion_tecnica',
  'fin_averia_tiempo_respuesta', 'prioridad', 'estado',
]);

/**
 * Filtra el body y deja solo las claves permitidas con valores válidos.
 * @param {Record<string, unknown>} body - Cuerpo de la petición
 * @returns {Record<string, unknown>} - Objeto listo para insert
 */
function sanitizePayload(body) {
  const payload = {};
  for (const key of ALLOWED_KEYS) {
    if (!(key in body)) continue;
    const value = body[key];
    if (value === null || value === undefined || value === '') continue;
    if (typeof value === 'string' && !value.trim()) continue;
    payload[key] = value;
  }
  return payload;
}

class Case {
  /**
   * Crea un nuevo caso en Supabase.
   * @param {Record<string, unknown>} body - Datos del caso (aviso obligatorio)
   * @returns {Promise<{ data?: object, error?: Error }>}
   */
  static async createCase(body) {
    // Manejar aviso como string para evitar notación científica con números grandes
    let aviso = '';
    if (body?.aviso != null) {
      // Si viene como número, convertirlo a string sin notación científica
      if (typeof body.aviso === 'number') {
        aviso = String(Math.floor(body.aviso));
      } else {
        aviso = String(body.aviso).trim();
      }
    }
    if (!aviso) throw new Error('El aviso es obligatorio');
    
    // Validar que sea un número entero válido (usando regex para evitar problemas con números grandes)
    if (!/^\d+$/.test(aviso)) {
      throw new Error('El aviso debe ser un número entero mayor o igual a 0');
    }
    
    const payload = sanitizePayload(body);
    payload.aviso = aviso; // Siempre como string
    
    // Calcular fecha_creacion automáticamente solo si no se proporciona
    // (útil para importaciones desde Excel donde viene la fecha)
    if (!payload.fecha_creacion) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      payload.fecha_creacion = `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    }
    
    // Buscar denominación de ubicación técnica basada en el código de ubicación
    if (payload.ubicacion) {
      const codigoTienda = String(payload.ubicacion).trim();
      // Validar que sean exactamente 4 dígitos
      if (/^\d{4}$/.test(codigoTienda)) {
        try {
          const { data: tienda, error: tiendaError } = await supabase
            .from('tiendas')
            .select('nombre')
            .eq('codigo', codigoTienda)
            .single();
          
          if (tiendaError) {
            // Si no se encuentra la tienda y hay FK estricta, la BD rechazará la inserción
            // Pero es mejor validar antes para dar un mensaje más claro
            throw new Error(`El código de ubicación "${codigoTienda}" no existe en la base de datos de tiendas`);
          }
          
          if (tienda?.nombre) {
            payload.denominacion_ubicacion_tecnica = tienda.nombre;
          }
        } catch (err) {
          // Si es un error de validación (tienda no encontrada), propagarlo
          if (err.message.includes('no existe')) {
            throw err;
          }
          // Si hay otro error al buscar, continuar sin rellenar denominacion_ubicacion_tecnica
          console.error('Error al buscar tienda:', err);
        }
      }
    }
    
    const { data, error } = await supabase.from('casos').insert(payload).select().single();
    if (error) {
      // Mejorar mensaje de error si es por violación de Foreign Key
      if (error.code === '23503' || error.message.includes('foreign key')) {
        throw new Error(`El código de ubicación "${payload.ubicacion}" no existe en la base de datos de tiendas`);
      }
      // Mejorar mensaje de error si es por duplicado
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        throw new Error(`El aviso "${payload.aviso}" ya existe en la base de datos`);
      }
      console.error('Error de Supabase al insertar caso:', error);
      throw error;
    }
    return { data };
  }

  /**
   * Obtiene un caso por su ID
   * @param {string} id - ID del caso (UUID)
   * @returns {Promise<object|null>} - Caso encontrado con dias_atraso calculado o null
   */
  static async getCaseById(id) {
    const idStr = String(id).trim();
    const { data, error } = await supabase
      .from('casos')
      .select('*')
      .eq('id', idStr)
      .single();
    
    if (error) {
      // Si no se encuentra, retornar null en lugar de lanzar error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    // Calcular días de atraso (igual que en getAllCases)
    if (data && data.fin_averia_tiempo_respuesta) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        const fechaStr = String(data.fin_averia_tiempo_respuesta).split('T')[0];
        const [year, month, day] = fechaStr.split('-').map(Number);
        const fechaFin = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        
        if (!isNaN(fechaFin.getTime())) {
          const diffTime = today - fechaFin;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          data.dias_atraso = diffDays >= 0 ? diffDays : 0;
        } else {
          data.dias_atraso = null;
        }
      } catch (err) {
        data.dias_atraso = null;
      }
    } else {
      data.dias_atraso = null;
    }
    
    return data;
  }

  /**
   * Obtiene un caso por su aviso
   * @param {string} aviso - Número de aviso
   * @returns {Promise<object|null>} - Caso encontrado o null
   */
  static async getCaseByAviso(aviso) {
    const avisoStr = String(aviso).trim();
    const { data, error } = await supabase
      .from('casos')
      .select('*')
      .eq('aviso', avisoStr)
      .single();
    
    if (error) {
      // Si no se encuentra, retornar null en lugar de lanzar error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  /**
   * Actualiza un caso existente
   * @param {string} aviso - Número de aviso del caso a actualizar
   * @param {Record<string, unknown>} body - Datos a actualizar
   * @returns {Promise<{ data?: object, error?: Error }>}
   */
  static async updateCase(aviso, body) {
    const avisoStr = String(aviso).trim();
    if (!avisoStr) throw new Error('El aviso es obligatorio');
    
    const payload = sanitizePayload(body);
    // No permitir cambiar el aviso
    delete payload.aviso;
    
    // Buscar denominación de ubicación técnica si se actualiza la ubicación
    if (payload.ubicacion) {
      const codigoTienda = String(payload.ubicacion).trim();
      if (/^\d{4}$/.test(codigoTienda)) {
        try {
          const { data: tienda, error: tiendaError } = await supabase
            .from('tiendas')
            .select('nombre')
            .eq('codigo', codigoTienda)
            .single();
          
          if (tiendaError) {
            throw new Error(`El código de ubicación "${codigoTienda}" no existe en la base de datos de tiendas`);
          }
          
          if (tienda?.nombre) {
            payload.denominacion_ubicacion_tecnica = tienda.nombre;
          }
        } catch (err) {
          if (err.message.includes('no existe')) {
            throw err;
          }
          console.error('Error al buscar tienda:', err);
        }
      }
    }
    
    // Si no hay nada que actualizar, retornar el caso existente
    if (Object.keys(payload).length === 0) {
      return await this.getCaseByAviso(avisoStr);
    }
    
    const { data, error } = await supabase
      .from('casos')
      .update(payload)
      .eq('aviso', avisoStr)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23503' || error.message.includes('foreign key')) {
        throw new Error(`El código de ubicación "${payload.ubicacion}" no existe en la base de datos de tiendas`);
      }
      throw error;
    }
    
    return { data };
  }

  /**
   * Compara dos casos y retorna los campos que han cambiado
   * @param {object} existingCase - Caso existente en la BD
   * @param {object} newCaseData - Nuevos datos del caso
   * @returns {object} - Objeto con los campos que han cambiado
   */
  static compareCases(existingCase, newCaseData) {
    const changes = {};
    const fieldsToCompare = [
      'texto_breve',
      'tipologia',
      'prioridad',
      'zona',
      'ubicacion',
      'fecha_creacion',
      'fin_averia_tiempo_respuesta',
      'estado',
    ];
    
    for (const field of fieldsToCompare) {
      const existingValue = existingCase[field];
      const newValue = newCaseData[field];
      
      // Normalizar valores para comparación
      const normalizedExisting = existingValue != null ? String(existingValue).trim() : '';
      const normalizedNew = newValue != null ? String(newValue).trim() : '';
      
      // Comparar fechas (normalizar formato)
      if (field.includes('fecha') || field === 'fecha_creacion' || field === 'fin_averia_tiempo_respuesta') {
        const existingDate = normalizedExisting.split('T')[0]; // Solo la parte de fecha
        const newDate = normalizedNew.split('T')[0];
        if (existingDate !== newDate && newDate) {
          changes[field] = { old: existingValue, new: newValue };
        }
      } else {
        // Comparar otros campos
        if (normalizedExisting !== normalizedNew && normalizedNew) {
          changes[field] = { old: existingValue, new: newValue };
        }
      }
    }
    
    return changes;
  }

  /**
   * Obtiene todos los casos con cálculo automático de días de atraso.
   * Los días de atraso se calculan como la diferencia entre hoy y fin_averia_tiempo_respuesta.
   * @returns {Promise<Array>} - Array de casos con dias_atraso calculado
   */
  static async getAllCases() {
    const { data, error } = await supabase
      .from('casos')
      .select('*')
      .order('fecha_creacion', { ascending: false });
    
    if (error) throw error;
    
    // Calcular días de atraso para cada caso
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparar solo fechas
    
    const casesWithDiasAtraso = (data || []).map(caso => {
      let diasAtraso = null;
      
      if (caso.fin_averia_tiempo_respuesta) {
        try {
          // Parsear la fecha correctamente (viene como string DATE "YYYY-MM-DD" de Supabase)
          // Extraer solo la parte de fecha (primeros 10 caracteres) para evitar problemas de zona horaria
          const fechaStr = String(caso.fin_averia_tiempo_respuesta).split('T')[0]; // "YYYY-MM-DD"
          const [year, month, day] = fechaStr.split('-').map(Number);
          
          // Crear fecha en UTC para evitar problemas de zona horaria
          const fechaFin = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
          
          if (!isNaN(fechaFin.getTime())) {
            // Calcular diferencia en días (puede ser negativo si la fecha es futura)
            const diffTime = today - fechaFin;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            diasAtraso = diffDays >= 0 ? diffDays : 0; // Solo días positivos (atrasos)
          }
        } catch (err) {
          // Si hay error al parsear, dejar como null
          diasAtraso = null;
        }
      }
      
      return {
        ...caso,
        dias_atraso: diasAtraso,
      };
    });
    
    return casesWithDiasAtraso;
  }
}

export default Case;
