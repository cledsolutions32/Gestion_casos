import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento en memoria (no guarda archivos en disco)
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes y PDFs
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (.jpg, .jpeg, .png, .gif, .webp) y PDFs (.pdf)'), false);
  }
};

const uploadEvidencias = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
  },
});

export default uploadEvidencias;
