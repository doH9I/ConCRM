"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const attachments_1 = require("../controllers/attachments");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
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
        }
        else {
            cb(new Error('File type not allowed'), false);
        }
    }
});
router.get('/', attachments_1.getAttachments);
router.get('/search', attachments_1.searchAttachments);
router.get('/:id', attachments_1.getAttachment);
router.get('/:id/download', attachments_1.downloadAttachment);
router.post('/upload', upload.single('file'), attachments_1.uploadAttachment);
router.delete('/:id', attachments_1.deleteAttachment);
router.post('/:id/ocr', attachments_1.processOCR);
exports.default = router;
//# sourceMappingURL=attachments.js.map