import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento en memoria (no guarda archivos en disco)
const storage = multer.memoryStorage();

// Filtro para aceptar solo archivos Excel
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo (aumentado para archivos Excel grandes)
  },
});

export default upload;
