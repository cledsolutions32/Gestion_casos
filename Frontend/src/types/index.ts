/** Caso almacenado en Supabase (tabla public.casos). El identificador de negocio es `aviso`. */
export type Case = {
  id: string;
  /** Identificador de negocio del caso (único). Mostrar como "Caso #aviso" en la UI. */
  aviso: string;
  dias_atraso: number | null;
  tipologia: string | null;
  fecha_creacion: string | null; // ISO date (YYYY-MM-DD)
  texto_breve: string | null; // Descripción
  zona: string | null;
  ubicacion: string | null;
  denominacion_ubicacion_tecnica: string | null;
  fin_averia_tiempo_respuesta: string | null;
  prioridad: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
};

/** Novedad almacenada en Supabase (tabla public.novedades). */
export type Novedad = {
  id: string;
  caso_id: string;
  texto: string;
  fecha_creacion: string; // ISO timestamp
  created_at: string;
  updated_at: string;
};

/** Evidencia almacenada en Supabase (tabla public.evidencias). */
export type Evidencia = {
  id: string;
  caso_id: string;
  nombre_archivo: string;
  tipo_archivo: "image" | "pdf";
  ruta_storage: string;
  tamaño_bytes: number;
  mime_type: string;
  fecha_subida: string; // ISO timestamp
  created_at: string;
  updated_at: string;
  url?: string; // URL pública del archivo (agregada por el backend)
};
