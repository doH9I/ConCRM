import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDefects,
  getDefect,
  createDefect,
  updateDefect,
  deleteDefect,
  assignDefect,
  resolveDefect,
  reopenDefect,
  getDefectStats,
  uploadDefectPhotos
} from '../controllers/defects';

const router = Router();

router.use(authenticate);

// Основные CRUD операции для дефектовок
router.get('/', getDefects);
router.get('/stats', getDefectStats);
router.get('/:id', getDefect);
router.post('/', createDefect);
router.put('/:id', updateDefect);
router.delete('/:id', deleteDefect);

// Специальные операции
router.post('/:id/assign', assignDefect);
router.post('/:id/resolve', resolveDefect);
router.post('/:id/reopen', reopenDefect);
router.post('/:id/photos', uploadDefectPhotos);

export default router;