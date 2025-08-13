import { Response } from 'express';
import { dbService, supabase, supabaseAdmin } from '../utils/supabase';
import { AuthenticatedRequest, Attachment, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logInfo } from '../middleware/logger';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

// Получить все вложения
export const getAttachments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = '1',
    limit = '10',
    entity_type,
    entity_id,
    search,
    sort = 'created_at',
    order = 'desc'
  } = req.query;

  const filters: Record<string, any> = {};
  
  if (entity_type) filters.entity_type = entity_type;
  if (entity_id) filters.entity_id = entity_id;
  if (search) filters.search = search;

  const result = await dbService.getPaginated<Attachment>(
    'attachments',
    parseInt(page as string),
    parseInt(limit as string),
    filters,
    { column: sort as string, ascending: order === 'asc' }
  );

  res.json({
    success: true,
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    }
  } as PaginatedResponse<Attachment>);
});

// Получить вложение по ID
export const getAttachment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const attachment = await dbService.getById<Attachment>('attachments', id);

  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  res.json({
    success: true,
    data: attachment
  } as ApiResponse<Attachment>);
});

// Загрузить файл
export const uploadAttachment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const { entity_type, entity_id, description } = req.body;

  if (!entity_type || !entity_id) {
    throw new AppError('entity_type and entity_id are required', 400);
  }

  try {
    // Генерируем уникальное имя файла
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
    const filePath = `attachments/${entity_type}/${entity_id}/${fileName}`;

    // Читаем файл
    const fileBuffer = fs.readFileSync(req.file.path);

    // Загружаем в Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedBy: req.user.id
        }
      });

    if (uploadError) {
      throw new AppError(`File upload failed: ${uploadError.message}`, 500);
    }

    // Получаем публичный URL
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Сохраняем информацию о файле в БД
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

    const attachment = await dbService.create<Attachment>('attachments', attachmentData);

    // Удаляем временный файл
    fs.unlinkSync(req.file.path);

    // Если это изображение, запускаем OCR
    if (req.file.mimetype.startsWith('image/')) {
      processOCRAsync(attachment.id, req.file.path);
    }

    logInfo('File uploaded', { 
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
    } as ApiResponse<any>);

  } catch (error: any) {
    // Удаляем временный файл в случае ошибки
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError(`File upload failed: ${error.message}`, 500);
  }
});

// Удалить вложение
export const deleteAttachment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Получаем информацию о файле
  const attachment = await dbService.getById<Attachment>('attachments', id);

  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  // Удаляем файл из Storage
  const { error: deleteError } = await supabaseAdmin.storage
    .from('documents')
    .remove([attachment.file_path]);

  if (deleteError) {
    logInfo('Failed to delete file from storage', { error: deleteError, filePath: attachment.file_path });
  }

  // Удаляем запись из БД
  await dbService.delete('attachments', id);

  logInfo('Attachment deleted', { attachmentId: id, userId: req.user?.id });

  res.json({
    success: true,
    message: 'Attachment deleted successfully'
  });
});

// Скачать файл
export const downloadAttachment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const attachment = await dbService.getById<Attachment>('attachments', id);

  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  // Получаем подписанный URL для скачивания
  const { data: signedUrlData, error } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUrl(attachment.file_path, 3600); // 1 час

  if (error) {
    throw new AppError(`Failed to generate download link: ${error.message}`, 500);
  }

  res.json({
    success: true,
    data: {
      download_url: signedUrlData.signedUrl,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    }
  });
});

// Поиск вложений
export const searchAttachments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { q, entity_type, limit = '20' } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  let query = supabase
    .from('attachments')
    .select('*')
    .textSearch('search_vector', String(q), {
      type: 'websearch',
      config: 'russian'
    })
    .limit(parseInt(limit as string));

  if (entity_type) {
    query = query.eq('entity_type', entity_type);
  }

  const { data: attachments, error } = await query;

  if (error) {
    throw new AppError(`Search failed: ${error.message}`, 500);
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

// Обработка OCR
export const processOCR = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const attachment = await dbService.getById<Attachment>('attachments', id);

  if (!attachment) {
    throw new AppError('Attachment not found', 404);
  }

  if (!attachment.mime_type.startsWith('image/')) {
    throw new AppError('OCR is only available for images', 400);
  }

  try {
    // Получаем файл из Storage
    const { data: fileData, error } = await supabaseAdmin.storage
      .from('documents')
      .download(attachment.file_path);

    if (error) {
      throw new AppError(`Failed to download file: ${error.message}`, 500);
    }

    // Конвертируем в buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Обрабатываем изображение с помощью sharp для лучшего качества OCR
    const processedImage = await sharp(buffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    // Выполняем OCR
    const { data: { text } } = await Tesseract.recognize(processedImage, 'rus+eng', {
      logger: () => {} // Отключаем логирование
    });

    // Сохраняем результат OCR
    await dbService.update('attachments', id, {
      ocr_text: text.trim()
    });

    logInfo('OCR processed', { attachmentId: id, textLength: text.length });

    res.json({
      success: true,
      data: {
        ocr_text: text.trim()
      }
    });

  } catch (error: any) {
    throw new AppError(`OCR processing failed: ${error.message}`, 500);
  }
});

// Асинхронная обработка OCR (для фоновой обработки)
async function processOCRAsync(attachmentId: string, filePath: string): Promise<void> {
  try {
    const attachment = await dbService.getById<Attachment>('attachments', attachmentId);
    if (!attachment || !attachment.mime_type.startsWith('image/')) {
      return;
    }

    // Получаем файл из Storage
    const { data: fileData, error } = await supabaseAdmin.storage
      .from('documents')
      .download(attachment.file_path);

    if (error) return;

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const processedImage = await sharp(buffer)
      .greyscale()
      .normalize()
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(processedImage, 'rus+eng');

    await dbService.update('attachments', attachmentId, {
      ocr_text: text.trim()
    });

    logInfo('Background OCR completed', { attachmentId, textLength: text.length });

  } catch (error) {
    logInfo('Background OCR failed', { attachmentId, error });
  }
}