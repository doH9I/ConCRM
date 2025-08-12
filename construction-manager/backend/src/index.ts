import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения
dotenv.config();

// Импортируем маршруты
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import employeeRoutes from './routes/employees';
import materialRoutes from './routes/materials';
import financialRoutes from './routes/financial';
import estimateRoutes from './routes/estimates';
import ksRoutes from './routes/ks-reports';
import defectRoutes from './routes/defects';
import attachmentRoutes from './routes/attachments';
import reportRoutes from './routes/reports';
import dashboardRoutes from './routes/dashboard';

// Импортируем middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Настройка rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 запросов на IP
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Настройка CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Применяем middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

app.use(cors(corsOptions));
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));
app.use(requestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Construction Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/ks-reports', ksRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Construction Manager API server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;