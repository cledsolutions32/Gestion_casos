import supabase from '../config/db.js';
import { randomUUID } from 'crypto';
import path from 'path';

/**
 * Sube un archivo a Supabase Storage
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} originalName - Nombre original del archivo
 * @param {string} casoId - ID del caso
 * @returns {Promise<{ ruta: string, url: string }>}
 */
export async function uploadFileToStorage(fileBuffer, originalName, casoId) {
  // Generar nombre único para el archivo
  const ext = path.extname(originalName);
  const fileName = `${casoId}/${randomUUID()}${ext}`;
  
  // Determinar tipo de archivo
  const tipoArchivo = ext.toLowerCase() === '.pdf' ? 'pdf' : 'image';
  
  // Determinar MIME type
  let mimeType = 'application/octet-stream';
  if (ext.toLowerCase() === '.pdf') {
    mimeType = 'application/pdf';
  } else if (['.jpg', '.jpeg'].includes(ext.toLowerCase())) {
    mimeType = 'image/jpeg';
  } else if (ext.toLowerCase() === '.png') {
    mimeType = 'image/png';
  } else if (ext.toLowerCase() === '.gif') {
    mimeType = 'image/gif';
  } else if (ext.toLowerCase() === '.webp') {
    mimeType = 'image/webp';
  }

  // Subir archivo a Supabase Storage
  const { data, error } = await supabase.storage
    .from('evidencias')
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  // No retornamos URL aquí porque usaremos URLs firmadas cuando se soliciten
  return {
    ruta: fileName,
    tipoArchivo,
    mimeType,
  };
}

/**
 * Genera una URL firmada para acceder a un archivo de forma segura
 * @param {string} filePath - Ruta del archivo en Storage
 * @param {number} expiresIn - Tiempo de expiración en segundos (default: 1 hora)
 * @returns {Promise<string>}
 */
export async function getSignedUrl(filePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from('evidencias')
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Error al generar URL firmada: ${error.message}`);
  }

  return data?.signedUrl || '';
}
