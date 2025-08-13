"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reports_1 = require("../controllers/reports");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/projects', reports_1.getProjectReport);
router.get('/financial', reports_1.getFinancialReport);
router.get('/time-tracking', reports_1.getTimeTrackingReport);
router.get('/materials', reports_1.getMaterialReport);
router.get('/productivity', reports_1.getProductivityReport);
router.get('/custom', reports_1.getCustomReport);
router.get('/projects/export/pdf', reports_1.exportReportToPDF);
router.get('/projects/export/excel', reports_1.exportReportToExcel);
router.get('/financial/export/pdf', reports_1.exportReportToPDF);
router.get('/financial/export/excel', reports_1.exportReportToExcel);
exports.default = router;
//# sourceMappingURL=reports.js.map