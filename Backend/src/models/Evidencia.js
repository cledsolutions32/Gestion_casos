import supabase from '../config/db.js';

class Evidencia {
  /**
   * Crea una nueva evidencia para un caso
   * @param {string} casoId - ID del caso (UUID)
   * @param {object} fileData - Datos del archivo
   * @param {string} fileData.nombre_archivo - Nombre original del archivo
   * @param {string} fileData.tipo_archivo - 'image' o 'pdf'
   * @param {string} fileData.ruta_storage - Ruta en Supabase Storage
   * @param {number} fileData.tamaño_bytes - Tamaño en bytes
   * @param {string} fileData.mime_type - Tipo MIME
   * @returns {Promise<{ data?: object, error?: Error }>}
   */
  static async createEvidencia(casoId, fileData) {
    if (!casoId || typeof casoId !== 'string' || !casoId.trim()) {
      throw new Error('El ID del caso es obligatorio');
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
      .from('evidencias')
      .insert({
        caso_id: casoId,
        nombre_archivo: fileData.nombre_archivo,
        tipo_archivo: fileData.tipo_archivo,
        ruta_storage: fileData.ruta_storage,
        tamaño_bytes: fileData.tamaño_bytes,
        mime_type: fileData.mime_type,
        fecha_subida: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data };
  }

  /**
   * Obtiene todas las evidencias de un caso
   * @param {string} casoId - ID del caso (UUID)
   * @returns {Promise<Array>}
   */
  static async getEvidenciasByCasoId(casoId) {
    if (!casoId || typeof casoId !== 'string' || !casoId.trim()) {
      throw new Error('El ID del caso es obligatorio');
    }

    const { data, error } = await supabase
      .from('evidencias')
      .select('*')
      .eq('caso_id', casoId)
      .order('fecha_subida', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene una evidencia por su ID
   * @param {string} id - ID de la evidencia (UUID)
   * @returns {Promise<object | null>}
   */
  static async getEvidenciaById(id) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('El ID de la evidencia es obligatorio');
    }

    const { data, error } = await supabase
      .from('evidencias')
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
   * Elimina una evidencia
   * @param {string} id - ID de la evidencia (UUID)
   * @returns {Promise<void>}
   */
  static async deleteEvidencia(id) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('El ID de la evidencia es obligatorio');
    }

    // Obtener la evidencia para obtener la ruta del archivo
    const evidencia = await this.getEvidenciaById(id);
    if (!evidencia) {
      throw new Error('Evidencia no encontrada');
    }

    // Eliminar el archivo de Storage
    const { error: storageError } = await supabase.storage
      .from('evidencias')
      .remove([evidencia.ruta_storage]);

    if (storageError) {
      console.error('Error al eliminar archivo de Storage:', storageError);
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar el registro de la base de datos
    const { error } = await supabase
      .from('evidencias')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}

export default Evidencia;
