# Инструкции по развертыванию Construction Manager

## Предварительные требования

- Node.js 18+ 
- npm или yarn
- Аккаунт Supabase
- Git

## 1. Настройка Supabase

### Создание проекта
1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации

### Выполнение миграций
1. Откройте SQL Editor в Supabase Dashboard
2. Выполните миграции в следующем порядке:

```sql
-- 1. Выполните содержимое файла database/migrations/001_initial_schema.sql
-- 2. Выполните содержимое файла database/migrations/002_rls_policies.sql  
-- 3. Выполните содержимое файла database/migrations/003_additional_features.sql
-- 4. Выполните содержимое файла database/migrations/004_storage_buckets.sql
```

### Настройка Storage
В Supabase Dashboard:
1. Перейдите в Storage
2. Убедитесь, что созданы все buckets:
   - avatars (публичный)
   - documents (приватный)
   - photos (приватный) 
   - estimates (приватный)
   - ks-reports (приватный)
   - contracts (приватный)
   - backups (приватный)

### Настройка аутентификации
1. В Authentication > Settings включите:
   - Email confirmations (по желанию)
   - Password requirements
2. Настройте Email templates при необходимости

## 2. Настройка Backend

### Установка зависимостей
```bash
cd backend
npm install
```

### Настройка переменных окружения
```bash
cp .env.example .env
```

Заполните `.env` файл:
```env
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT Configuration  
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Email Configuration (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# OCR Configuration
TESSERACT_LANG=rus+eng

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend URL for password reset
FRONTEND_URL=http://localhost:3000
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для production
```bash
npm run build
npm start
```

## 3. Настройка Frontend

### Установка зависимостей
```bash
cd frontend
npm install --legacy-peer-deps
```

### Настройка переменных окружения
```bash
cp .env.example .env
```

Заполните `.env` файл:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=http://localhost:3001
REACT_APP_APP_NAME=Construction Manager
REACT_APP_VERSION=1.0.0
```

### Запуск в режиме разработки
```bash
npm start
```

### Сборка для production
```bash
npm run build
```

## 4. Production развертывание

### Backend (Railway/Heroku/DigitalOcean)

#### Railway
1. Подключите GitHub репозиторий
2. Выберите папку `backend`
3. Настройте переменные окружения
4. Railway автоматически развернет приложение

#### Heroku
```bash
# Установите Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_KEY=your_service_key
heroku config:set JWT_SECRET=your_jwt_secret
# ... другие переменные

git subtree push --prefix backend heroku main
```

#### DigitalOcean App Platform
1. Создайте новое приложение
2. Подключите GitHub репозиторий
3. Укажите папку `backend`
4. Настройте переменные окружения
5. Разверните приложение

### Frontend (Vercel/Netlify)

#### Vercel
```bash
# Установите Vercel CLI
npm i -g vercel
cd frontend
vercel

# Настройте переменные окружения в Vercel Dashboard
```

#### Netlify
1. Подключите GitHub репозиторий
2. Build command: `npm run build`
3. Publish directory: `build`
4. Base directory: `frontend`
5. Настройте переменные окружения

## 5. Настройка домена и SSL

### Backend
- Настройте домен в вашем хостинг провайдере
- SSL сертификат обычно предоставляется автоматически

### Frontend
- Настройте домен в Vercel/Netlify
- SSL сертификат предоставляется автоматически
- Обновите CORS_ORIGIN в backend на ваш домен

## 6. Мониторинг и логи

### Настройка логирования
Backend использует Winston для логирования:
- Логи сохраняются в `logs/` директории
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`

### Мониторинг
Рекомендуется настроить мониторинг:
- Uptime мониторинг (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)

## 7. Резервное копирование

### База данных
Supabase автоматически создает резервные копии, но рекомендуется:
1. Настроить дополнительные бэкапы через Supabase CLI
2. Экспортировать схему базы данных регулярно

### Файлы
Storage файлы в Supabase также резервируются, но для критически важных файлов настройте дополнительное копирование.

## 8. Обновления

### Обновление кода
```bash
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
```

### Обновление базы данных
При появлении новых миграций выполните их в Supabase Dashboard.

## 9. Безопасность

### Рекомендации
1. Используйте сложные пароли для всех сервисов
2. Регулярно обновляйте зависимости
3. Настройте HTTPS для всех доменов
4. Используйте переменные окружения для всех секретов
5. Ограничьте доступ к Supabase Dashboard
6. Настройте RLS политики правильно
7. Регулярно проверяйте логи на подозрительную активность

## 10. Производительность

### Оптимизация
1. Настройте CDN для статических файлов
2. Используйте кэширование для API запросов
3. Оптимизируйте изображения
4. Минифицируйте CSS и JS
5. Настройте gzip сжатие

## Поддержка

При возникновении проблем:
1. Проверьте логи backend и frontend
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус Supabase сервисов
4. Обратитесь к документации Supabase

## Контрольный список развертывания

- [ ] Создан проект Supabase
- [ ] Выполнены все миграции БД
- [ ] Настроены Storage buckets
- [ ] Настроена аутентификация
- [ ] Backend развернут и работает
- [ ] Frontend развернут и работает
- [ ] Настроены домены и SSL
- [ ] Проверена работа всех основных функций
- [ ] Настроен мониторинг
- [ ] Настроено резервное копирование
- [ ] Проведено тестирование безопасности