import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getKsReports,
  getKsReport,
  createKsReport,
  updateKsReport,
  deleteKsReport,
  addKsItem,
  updateKsItem,
  deleteKsItem,
  approveKsReport,
  exportKsReportToPDF,
  generateKsFromEstimate
} from '../controllers/ks-reports';

const router = Router();

router.use(authenticate);

// Основные CRUD операции для КС
router.get('/', getKsReports);
router.get('/:id', getKsReport);
router.post('/', createKsReport);
router.put('/:id', updateKsReport);
router.delete('/:id', deleteKsReport);

// Операции с позициями КС
router.post('/:id/items', addKsItem);
router.put('/:id/items/:itemId', updateKsItem);
router.delete('/:id/items/:itemId', deleteKsItem);

// Дополнительные операции
router.post('/:id/approve', approveKsReport);
router.get('/:id/export/pdf', exportKsReportToPDF);
router.post('/generate-from-estimate/:estimateId', generateKsFromEstimate);

export default router;