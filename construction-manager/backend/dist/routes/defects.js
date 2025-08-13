"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const defects_1 = require("../controllers/defects");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', defects_1.getDefects);
router.get('/stats', defects_1.getDefectStats);
router.get('/:id', defects_1.getDefect);
router.post('/', defects_1.createDefect);
router.put('/:id', defects_1.updateDefect);
router.delete('/:id', defects_1.deleteDefect);
router.post('/:id/assign', defects_1.assignDefect);
router.post('/:id/resolve', defects_1.resolveDefect);
router.post('/:id/reopen', defects_1.reopenDefect);
router.post('/:id/photos', defects_1.uploadDefectPhotos);
exports.default = router;
//# sourceMappingURL=defects.js.map