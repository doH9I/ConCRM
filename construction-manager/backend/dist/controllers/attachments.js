"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOCR = exports.searchAttachments = exports.downloadAttachment = exports.deleteAttachment = exports.uploadAttachment = exports.getAttachment = exports.getAttachments = void 0;
const supabase_1 = require("../utils/supabase");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
exports.getAttachments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', entity_type, entity_id, search, sort = 'created_at', order = 'desc' } = req.query;
    const filters = {};
    if (entity_type)
        filters.entity_type = entity_type;
    if (entity_id)
        filters.entity_id = entity_id;
    if (search)
        filters.search = search;
    const result = await supabase_1.dbService.getPaginated('attachments', parseInt(page), parseInt(limit), filters, { column: sort, ascending: order === 'asc' });
    res.json({
        success: true,
        data: result.data,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
        }
    });
});
exports.getAttachment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const attachment = await supabase_1.dbService.getById('attachments', id);
    if (!attachment) {
        throw new errorHandler_1.AppError('Attachment not found', 404);
    }
    res.json({
        success: true,
        data: attachment
    });
});
exports.uploadAttachment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new errorHandler_1.AppError('No file uploaded', 400);
    }
    if (!req.user) {
        throw new errorHandler_1.AppError('User not authenticated', 401);
    }
    const { entity_type, entity_id, description } = req.body;
    if (!entity_type || !entity_id) {
        throw new errorHandler_1.AppError('entity_type and entity_id are required', 400);
    }
    try {
        const fileExtension = path_1.default.extname(req.file.originalname);
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
        const filePath = `attachments/${entity_type}/${entity_id}/${fileName}`;
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const { data: uploadData, error: uploadError } = await supabase_1.supabaseAdmin.storage
            .from('documents')
            .upload(filePath, fileBuffer, {
            contentType: req.file.mimetype,
            metadata: {
                originalName: req.file.originalname,
                uploadedBy: req.user.id
            }
        });
        if (uploadError) {
            throw new errorHandler_1.AppError(`File upload failed: ${uploadError.message}`, 500);
        }
        const { data: urlData } = supabase_1.supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(filePath);
        const attachmentData = {
            name: fileName,
            original_name: req.file.originalname,
            file_path: filePath,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            entity_type,
            entity_id,
            uploaded_by: req.user.id,
            description: description || null
        };
        const attachment = await supabase_1.dbService.create('attachments', attachmentData);
        fs_1.default.unlinkSync(req.file.path);
        if (req.file.mimetype.startsWith('image/')) {
            processOCRAsync(attachment.id, req.file.path);
        }
        (0, logger_1.logInfo)('File uploaded', {
            attachmentId: attachment.id,
            fileName: req.file.originalname,
            userId: req.user.id
        });
        res.status(201).json({
            success: true,
            data: {
                ...attachment,
                url: urlData.publicUrl
            }
        });
    }
    catch (error) {
        if (req.file?.path && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        throw new errorHandler_1.AppError(`File upload failed: ${error.message}`, 500);
    }
});
exports.deleteAttachment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const attachment = await supabase_1.dbService.getById('attachments', id);
    if (!attachment) {
        throw new errorHandler_1.AppError('Attachment not found', 404);
    }
    const { error: deleteError } = await supabase_1.supabaseAdmin.storage
        .from('documents')
        .remove([attachment.file_path]);
    if (deleteError) {
        (0, logger_1.logInfo)('Failed to delete file from storage', { error: deleteError, filePath: attachment.file_path });
    }
    await supabase_1.dbService.delete('attachments', id);
    (0, logger_1.logInfo)('Attachment deleted', { attachmentId: id, userId: req.user?.id });
    res.json({
        success: true,
        message: 'Attachment deleted successfully'
    });
});
exports.downloadAttachment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const attachment = await supabase_1.dbService.getById('attachments', id);
    if (!attachment) {
        throw new errorHandler_1.AppError('Attachment not found', 404);
    }
    const { data: signedUrlData, error } = await supabase_1.supabaseAdmin.storage
        .from('documents')
        .createSignedUrl(attachment.file_path, 3600);
    if (error) {
        throw new errorHandler_1.AppError(`Failed to generate download link: ${error.message}`, 500);
    }
    res.json({
        success: true,
        data: {
            download_url: signedUrlData.signedUrl,
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
        }
    });
});
exports.searchAttachments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { q, entity_type, limit = '20' } = req.query;
    if (!q) {
        throw new errorHandler_1.AppError('Search query is required', 400);
    }
    let query = supabase_1.supabase
        .from('attachments')
        .select('*')
        .textSearch('search_vector', String(q), {
        type: 'websearch',
        config: 'russian'
    })
        .limit(parseInt(limit));
    if (entity_type) {
        query = query.eq('entity_type', entity_type);
    }
    const { data: attachments, error } = await query;
    if (error) {
        throw new errorHandler_1.AppError(`Search failed: ${error.message}`, 500);
    }
    res.json({
        success: true,
        data: attachments,
        meta: {
            query: q,
            total: attachments.length
        }
    });
});
exports.processOCR = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const attachment = await supabase_1.dbService.getById('attachments', id);
    if (!attachment) {
        throw new errorHandler_1.AppError('Attachment not found', 404);
    }
    if (!attachment.mime_type.startsWith('image/')) {
        throw new errorHandler_1.AppError('OCR is only available for images', 400);
    }
    try {
        const { data: fileData, error } = await supabase_1.supabaseAdmin.storage
            .from('documents')
            .download(attachment.file_path);
        if (error) {
            throw new errorHandler_1.AppError(`Failed to download file: ${error.message}`, 500);
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const processedImage = await (0, sharp_1.default)(buffer)
            .greyscale()
            .normalize()
            .sharpen()
            .toBuffer();
        const { data: { text } } = await tesseract_js_1.default.recognize(processedImage, 'rus+eng', {
            logger: () => { }
        });
        await supabase_1.dbService.update('attachments', id, {
            ocr_text: text.trim()
        });
        (0, logger_1.logInfo)('OCR processed', { attachmentId: id, textLength: text.length });
        res.json({
            success: true,
            data: {
                ocr_text: text.trim()
            }
        });
    }
    catch (error) {
        throw new errorHandler_1.AppError(`OCR processing failed: ${error.message}`, 500);
    }
});
async function processOCRAsync(attachmentId, filePath) {
    try {
        const attachment = await supabase_1.dbService.getById('attachments', attachmentId);
        if (!attachment || !attachment.mime_type.startsWith('image/')) {
            return;
        }
        const { data: fileData, error } = await supabase_1.supabaseAdmin.storage
            .from('documents')
            .download(attachment.file_path);
        if (error)
            return;
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const processedImage = await (0, sharp_1.default)(buffer)
            .greyscale()
            .normalize()
            .toBuffer();
        const { data: { text } } = await tesseract_js_1.default.recognize(processedImage, 'rus+eng');
        await supabase_1.dbService.update('attachments', attachmentId, {
            ocr_text: text.trim()
        });
        (0, logger_1.logInfo)('Background OCR completed', { attachmentId, textLength: text.length });
    }
    catch (error) {
        (0, logger_1.logInfo)('Background OCR failed', { attachmentId, error });
    }
}
//# sourceMappingURL=attachments.js.map