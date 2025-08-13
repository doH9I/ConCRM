import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getEstimates,
  getEstimate,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  addEstimateItem,
  updateEstimateItem,
  deleteEstimateItem,
  duplicateEstimate,
  exportEstimateToExcel,
  calculateEstimateTotals,
  approveEstimate
} from '../controllers/estimates';

const router = Router();

router.use(authenticate);

// Основные CRUD операции для смет
router.get('/', getEstimates);
router.get('/:id', getEstimate);
router.post('/', createEstimate);
router.put('/:id', updateEstimate);
router.delete('/:id', deleteEstimate);

// Операции с позициями сметы
router.post('/:id/items', addEstimateItem);
router.put('/:id/items/:itemId', updateEstimateItem);
router.delete('/:id/items/:itemId', deleteEstimateItem);

// Дополнительные операции
router.post('/:id/duplicate', duplicateEstimate);
router.post('/:id/calculate', calculateEstimateTotals);
router.post('/:id/approve', approveEstimate);
router.get('/:id/export/excel', exportEstimateToExcel);

export default router;