import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProjectReport,
  getFinancialReport,
  getTimeTrackingReport,
  getMaterialReport,
  getProductivityReport,
  exportReportToPDF,
  exportReportToExcel,
  getCustomReport
} from '../controllers/reports';

const router = Router();

router.use(authenticate);

// Различные типы отчетов
router.get('/projects', getProjectReport);
router.get('/financial', getFinancialReport);
router.get('/time-tracking', getTimeTrackingReport);
router.get('/materials', getMaterialReport);
router.get('/productivity', getProductivityReport);
router.get('/custom', getCustomReport);

// Экспорт отчетов
router.get('/projects/export/pdf', exportReportToPDF);
router.get('/projects/export/excel', exportReportToExcel);
router.get('/financial/export/pdf', exportReportToPDF);
router.get('/financial/export/excel', exportReportToExcel);

export default router;