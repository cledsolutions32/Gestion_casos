import supabase from '../config/db.js';

class Novedad {
  /**
   * Crea una nueva novedad para un caso
   * @param {string} casoId - ID del caso (UUID)
   * @param {string} texto - Texto de la novedad
   * @returns {Promise<{ data?: object, error?: Error }>}
   */
  static async createNovedad(casoId, texto) {
    if (!casoId || typeof casoId !== 'string' || !casoId.trim()) {
      throw new Error('El ID del caso es obligatorio');
    }
    
    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      throw new Error('El texto de la novedad es obligatorio');
    }

    // Verificar que el caso existe
    const { data: caso, error: casoError } = await supabase
      .from('casos')
      .select('id')
      .eq('id', casoId)
      .single();

    if (casoError || !caso) {
      throw new Error('El caso no existe');
    }

    const { data, error } = await supabase
      .from('novedades')
      .insert({
        caso_id: casoId,
        texto: texto.trim(),
        fecha_creacion: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data };
  }

  /**
   * Obtiene todas las novedades de un caso
   * @param {string} casoId - ID del caso (UUID)
   * @returns {Promise<Array>}
   */
  static async getNovedadesByCasoId(casoId) {
    if (!casoId || typeof casoId !== 'string' || !casoId.trim()) {
      throw new Error('El ID del caso es obligatorio');
    }

    const { data, error } = await supabase
      .from('novedades')
      .select('*')
      .eq('caso_id', casoId)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene una novedad por su ID
   * @param {string} id - ID de la novedad (UUID)
   * @returns {Promise<object | null>}
   */
  static async getNovedadById(id) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('El ID de la novedad es obligatorio');
    }

    const { data, error } = await supabase
      .from('novedades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw error;
    }

    return data;
  }

  /**
   * Actualiza una novedad
   * @param {string} id - ID de la novedad (UUID)
   * @param {string} texto - Nuevo texto de la novedad
   * @returns {Promise<{ data?: object, error?: Error }>}
   */
  static async updateNovedad(id, texto) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('El ID de la novedad es obligatorio');
    }

    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      throw new Error('El texto de la novedad es obligatorio');
    }

    const { data, error } = await supabase
      .from('novedades')
      .update({ texto: texto.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Novedad no encontrada');
      }
      throw error;
    }

    return { data };
  }

  /**
   * Elimina una novedad
   * @param {string} id - ID de la novedad (UUID)
   * @returns {Promise<void>}
   */
  static async deleteNovedad(id) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('El ID de la novedad es obligatorio');
    }

    const { error } = await supabase
      .from('novedades')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}

export default Novedad;
