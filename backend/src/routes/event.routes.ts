import { NextFunction, Request, Response, Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { adminMiddleware, authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { EventService } from '../services/event.service';

const router = Router();

// Interfaz para request con archivo
interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
}

// Configurar multer para manejar archivos Excel en memoria
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Solo aceptar archivos Excel
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  },
});

// Configurar multer para manejar imágenes con almacenamiento en disco
const uploadImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const path = require('path');
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../../../public/images/eventos');

      // Crear directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Mantener el nombre original del archivo
      // Se sanitiza el nombre para evitar problemas
      const originalName = file.originalname;
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, sanitizedName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para imágenes
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Solo aceptar imágenes
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'));
    }
  },
});

// POST /api/events/upload - Subir archivo Excel (solo admin)
router.post(
  '/upload',
  authMiddleware,
  adminMiddleware,
  uploadExcel.single('file'),
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo',
        });
      }

      const result = await EventService.processExcelUpload(req.file.buffer);

      res.json({
        success: true,
        data: result,
        message: `Procesados: ${result.created} creados, ${result.updated} actualizados`,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/events/upload-image - Subir imagen de evento (solo admin)
router.post(
  '/upload-image',
  authMiddleware,
  adminMiddleware,
  uploadImage.single('image'),
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ninguna imagen',
        });
      }

      // Obtener la URL relativa de la imagen
      const imageUrl = `/images/eventos/${req.file.filename}`;

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          imageUrl: imageUrl,
          originalName: req.file.originalname,
          size: req.file.size,
        },
        message: 'Imagen subida exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/events/upload-images - Subir múltiples imágenes (solo admin)
router.post(
  '/upload-images',
  authMiddleware,
  adminMiddleware,
  uploadImage.array('images', 10), // Máximo 10 imágenes
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se han proporcionado imágenes',
        });
      }

      const uploadedImages = files.map((file) => ({
        filename: file.filename,
        imageUrl: `/images/eventos/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
      }));

      res.json({
        success: true,
        data: uploadedImages,
        message: `${files.length} imágenes subidas exitosamente`,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await EventService.getAllEvents();

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/categories
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await EventService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/search
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const events = await EventService.searchEvents(q);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/category/:category
router.get('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const events = await EventService.getEventsByCategory(category);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id
// GET /api/events/:idOrSlug - Obtener evento por ID o slug
router.get('/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;

    // Intentar primero buscar por slug, si falla buscar por ID
    let event;
    try {
      event = await EventService.getEventBySlug(idOrSlug);
    } catch {
      // Si no encuentra por slug, intentar por ID (para compatibilidad)
      event = await EventService.getEventById(idOrSlug);
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
