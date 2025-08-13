import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import {
  getAttachments,
  getAttachment,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  searchAttachments,
  processOCR
} from '../controllers/attachments';

const router = Router();

router.use(authenticate);

// Настройка multer для загрузки файлов
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Разрешенные типы файлов
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Основные операции с вложениями
router.get('/', getAttachments);
router.get('/search', searchAttachments);
router.get('/:id', getAttachment);
router.get('/:id/download', downloadAttachment);
router.post('/upload', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteAttachment);

// OCR обработка
router.post('/:id/ocr', processOCR);

export default router;