# Construction Manager - Улучшенный аналог Gectaro.com

## Описание проекта

Construction Manager - это полнофункциональная система управления строительными проектами, созданная как улучшенный аналог Gectaro.com. Система включает в себя все необходимые модули для комплексного управления строительством.

## Основные возможности

### 📋 Управление проектами
- Детальное ведение проектов
- Планирование этапов и задач
- Контроль сроков выполнения
- Назначение ответственных

### 💰 Финансовый модуль
- Ведение финансовых операций
- Полная отчетность
- Контроль бюджета проектов
- Анализ рентабельности

### 👥 Управление персоналом
- Учет сотрудников
- Табель учета рабочего времени
- Назначение задач
- Контроль выполнения работ

### 📦 Складской учет
- Управление материалами
- Контроль остатков
- Учет поставок
- Списание материалов

### 📊 Сметы и документооборот
- Загрузка и создание смет
- Экспорт смет в различных форматах
- Создание КС-2, КС-3, КС-6а по ГОСТ
- Автоматическое заполнение форм

### 🔍 Контроль качества
- Фиксация дефектовок
- Назначение исполнителей
- Контроль сроков устранения
- Отчеты о выполнении

### 📄 Документооборот
- Загрузка файлов в Supabase Storage
- OCR и полнотекстовый поиск
- Сканирование документов
- Генерация PDF с подписями

## Технологический стек

### Backend
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL)
- JWT аутентификация
- Multer для загрузки файлов

### Frontend
- React 18
- TypeScript
- Material-UI / Ant Design
- React Router
- Axios
- React Query

### База данных
- PostgreSQL (Supabase)
- Миграции SQL
- Row Level Security (RLS)

### Дополнительные сервисы
- Supabase Storage для файлов
- OCR API для распознавания текста
- PDF генерация с jsPDF/PDFKit

## Структура проекта

```
construction-manager/
├── backend/                 # Node.js API сервер
│   ├── src/
│   │   ├── controllers/     # Контроллеры API
│   │   ├── middleware/      # Middleware функции
│   │   ├── models/          # Модели данных
│   │   ├── routes/          # Маршруты API
│   │   ├── services/        # Бизнес-логика
│   │   └── utils/           # Утилиты
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React приложение
│   ├── public/
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/           # Страницы приложения
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API сервисы
│   │   ├── utils/           # Утилиты
│   │   └── types/           # TypeScript типы
│   ├── package.json
│   └── tsconfig.json
├── database/                # Миграции БД
│   ├── migrations/          # SQL миграции
│   └── seeds/               # Начальные данные
└── README.md
```

## Установка и запуск

### Предварительные требования
- Node.js 18+
- npm или yarn
- Аккаунт Supabase

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd construction-manager
```

### 2. Настройка Backend
```bash
cd backend
npm install
cp .env.example .env
# Заполните переменные окружения в .env
npm run dev
```

### 3. Настройка Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Заполните переменные окружения в .env
npm start
```

### 4. Настройка базы данных
```bash
# Выполните миграции в Supabase Dashboard
# или используйте Supabase CLI
supabase db reset
```

## Переменные окружения

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

### Frontend (.env)
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:3001
```

## Развертывание

### Production
1. Настройте Supabase проект
2. Выполните миграции базы данных
3. Разверните backend на Heroku/Railway/DigitalOcean
4. Разверните frontend на Vercel/Netlify
5. Настройте домены и SSL

## Особенности реализации

### Формы КС по ГОСТ
- Точные макеты государственных форм
- Автоматическое заполнение реквизитов
- Вставка подписей и печатей
- Экспорт в PDF с сохранением форматирования

### OCR и поиск
- Автоматическое распознавание текста в документах
- Полнотекстовый поиск по содержимому файлов
- Индексация attachments.tsv
- Продвинутые фильтры поиска

### Автоматизация
- Автоматическое создание отчетов
- Уведомления о сроках
- Интеграция с календарем
- Экспорт данных в Excel

## Лицензия

MIT License

## Поддержка

Для получения поддержки создайте issue в репозитории или свяжитесь с командой разработки.