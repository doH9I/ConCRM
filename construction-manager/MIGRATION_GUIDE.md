# Руководство по миграции Construction Manager на Supabase

## Обзор

Данное руководство поможет вам настроить и развернуть систему управления строительными проектами Construction Manager с использованием Supabase в качестве основы для базы данных и аутентификации.

## Предварительные требования

- Node.js версии 20 или выше
- npm или yarn
- Аккаунт Supabase
- Git

## Шаг 1: Настройка Supabase

### 1.1 Создание проекта Supabase

1. Перейдите на [https://supabase.com](https://supabase.com)
2. Войдите в свой аккаунт или создайте новый
3. Нажмите "New Project"
4. Выберите организацию
5. Укажите название проекта: "Construction Manager"
6. Создайте надежный пароль для базы данных
7. Выберите регион (рекомендуется ближайший к пользователям)
8. Нажмите "Create new project"

### 1.2 Настройка базы данных

После создания проекта:

1. Перейдите в SQL Editor в левом меню
2. Создайте новый SQL запрос
3. Выполните миграции в следующем порядке:

#### Миграция 1: Основная схема

```sql
-- Скопируйте содержимое из database/migrations/001_initial_schema.sql
```

#### Миграция 2: RLS политики

```sql
-- Скопируйте содержимое из database/migrations/002_rls_policies.sql
```

#### Миграция 3: Дополнительные функции

```sql
-- Скопируйте содержимое из database/migrations/003_additional_features.sql
```

#### Миграция 4: Storage настройки

```sql
-- Скопируйте содержимое из database/migrations/004_storage_buckets.sql
```

### 1.3 Настройка Storage

1. Перейдите в раздел "Storage" в левом меню
2. Создайте новый bucket с именем "documents"
3. Настройте политики доступа:
   - Разрешите чтение для аутентифицированных пользователей
   - Разрешите запись для аутентифицированных пользователей

### 1.4 Получение ключей API

1. Перейдите в Settings → API
2. Скопируйте следующие ключи:
   - Project URL: `https://accvbvtsfasftmvkgnxj.supabase.co`
   - anon/public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjY3ZidnRzZmFzZnRtdmtnbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTk3MDQsImV4cCI6MjA3MDU5NTcwNH0.xeugMF3n1uaq9jP57yy00Bz801PWxjLAoX-qKQ-as9E`
   - service_role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjY3ZidnRzZmFzZnRtdmtnbnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAxOTcwNCwiZXhwIjoyMDcwNTk1NzA0fQ.CTxb90RCAJ-qs_F-bbMhzV4ThSEgkKavouFhEt4NbJY`

## Шаг 2: Настройка Backend

### 2.1 Установка зависимостей

```bash
cd construction-manager/backend
npm install
```

### 2.2 Конфигурация окружения

Файл `.env` уже настроен с вашими ключами:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://accvbvtsfasftmvkgnxj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjY3ZidnRzZmFzZnRtdmtnbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTk3MDQsImV4cCI6MjA3MDU5NTcwNH0.xeugMF3n1uaq9jP57yy00Bz801PWxjLAoX-qKQ-as9E
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjY3ZidnRzZmFzZnRtdmtnbnhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAxOTcwNCwiZXhwIjoyMDcwNTk1NzA0fQ.CTxb90RCAJ-qs_F-bbMhzV4ThSEgkKavouFhEt4NbJY

# JWT Configuration
JWT_SECRET=CaMBeJI30091994!
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@constructionmanager.com

# Application Configuration
APP_NAME=Construction Manager API
APP_VERSION=1.0.0
```

### 2.3 Компиляция и запуск

```bash
# Сборка проекта
npm run build

# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start
```

## Шаг 3: Настройка Frontend

### 3.1 Установка зависимостей

```bash
cd construction-manager/frontend
npm install
```

### 3.2 Конфигурация окружения

Файл `.env` уже настроен:

```env
# Frontend Environment Variables
REACT_APP_SUPABASE_URL=https://accvbvtsfasftmvkgnxj.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjY3ZidnRzZmFzZnRtdmtnbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTk3MDQsImV4cCI6MjA3MDU5NTcwNH0.xeugMF3n1uaq9jP57yy00Bz801PWxjLAoX-qKQ-as9E

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001

# Application Configuration
REACT_APP_NAME=Construction Manager
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

### 3.3 Запуск приложения

```bash
# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build
```

## Шаг 4: Начальная настройка данных

### 4.1 Загрузка демо-данных (опционально)

```sql
-- Выполните в SQL Editor Supabase
-- Скопируйте содержимое из database/seeds/001_sample_data.sql
```

### 4.2 Создание первого администратора

1. Зарегистрируйтесь в приложении через интерфейс
2. В Supabase перейдите в Authentication → Users
3. Найдите созданного пользователя
4. В SQL Editor выполните:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

## Шаг 5: Продакшен развертывание

### 5.1 Настройка домена и SSL

1. В Supabase настройте custom domain (если нужно)
2. Обновите CORS настройки в Supabase Dashboard
3. Настройте SSL сертификаты

### 5.2 Переменные окружения для продакшена

```env
NODE_ENV=production
# Обновите остальные переменные для продакшена
```

### 5.3 Настройка мониторинга

1. Включите мониторинг в Supabase Dashboard
2. Настройте уведомления о превышении лимитов
3. Настройте резервное копирование

## Шаг 6: Безопасность

### 6.1 RLS Политики

Убедитесь, что все RLS политики активированы:

```sql
-- Проверьте статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 6.2 Настройка CORS

В Supabase Dashboard → Authentication → Settings обновите:
- Site URL: ваш домен
- Redirect URLs: список разрешенных URLs

### 6.3 Настройка email провайдера

1. Перейдите в Authentication → Settings → SMTP Settings
2. Настройте SMTP для отправки email

## Шаг 7: Функциональность

### 7.1 Основные модули

Система включает следующие модули:
- **Проекты**: Управление строительными проектами
- **Задачи**: Планирование и отслеживание задач
- **Сотрудники**: Управление персоналом
- **Финансы**: Учет доходов и расходов
- **Материалы**: Складской учет
- **Сметы**: Составление и управление сметами
- **КС отчеты**: Справки КС-2, КС-3, КС-6а
- **Дефектовки**: Учет дефектов
- **Документы**: Хранение и поиск документов
- **Отчеты**: Различные виды отчетности

### 7.2 Ключевые возможности

- Полнотекстовый поиск документов с OCR
- Экспорт в Excel и PDF
- Real-time уведомления
- Мобильная адаптация
- Автоматические расчеты
- Интеграция с email

## Устранение неполадок

### Частые проблемы

1. **Ошибка подключения к БД**
   - Проверьте правильность URL и ключей
   - Убедитесь что IP адрес разрешен в Supabase

2. **Ошибки CORS**
   - Проверьте настройки CORS в коде и Supabase
   - Убедитесь что домен добавлен в разрешенные

3. **Ошибки аутентификации**
   - Проверьте JWT секрет
   - Убедитесь что RLS политики настроены правильно

4. **Проблемы с файлами**
   - Проверьте настройки Storage bucket
   - Убедитесь что политики доступа настроены

### Логи и мониторинг

- Backend логи: см. консоль приложения
- Supabase логи: Dashboard → Logs
- Frontend ошибки: Console браузера

## Поддержка

Для получения поддержки:
1. Проверьте документацию Supabase
2. Изучите логи ошибок
3. Обратитесь к разработчикам проекта

## Дополнительные ресурсы

- [Документация Supabase](https://supabase.com/docs)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Material-UI](https://mui.com/)
- [Express.js](https://expressjs.com/)

---

**Важно**: После развертывания обязательно смените все демо пароли и настройте регулярное резервное копирование данных.