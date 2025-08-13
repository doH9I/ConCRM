# Construction Manager

Система управления строительными проектами - улучшенный аналог Gectaro.com

## 🚀 Возможности

- ✅ **Управление проектами** - создание, редактирование, отслеживание прогресса
- ✅ **Финансовый модуль** - доходы, расходы, бюджеты, отчеты
- ✅ **Современный интерфейс** - Material-UI, адаптивный дизайн
- ✅ **TypeScript** - полная типизация для надежности
- ⏳ **Модуль сотрудников** - управление персоналом и табель времени
- ⏳ **Складской учет** - материалы, операции, остатки
- ⏳ **Сметы** - создание, импорт/экспорт Excel
- ⏳ **Формы КС** - КС-2, КС-3, КС-6а по ГОСТ
- ⏳ **Учет дефектов** - фиксация и контроль устранения
- ⏳ **Документооборот** - загрузка, OCR, поиск

## 🛠️ Технологии

### Frontend
- React 19 + TypeScript
- Material-UI (MUI)
- React Router
- React Query
- Recharts для графиков
- Day.js для дат

### Backend  
- Node.js + Express + TypeScript
- Supabase (PostgreSQL + Auth)
- Полный REST API
- JWT аутентификация

## 📦 Установка и запуск

### Требования
- Node.js 18+
- npm или yarn
- Аккаунт Supabase

### Настройка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd construction-manager
```

2. **Настройте Backend**
```bash
cd backend
npm install
cp .env.example .env
# Заполните переменные окружения в .env
npm run dev
```

3. **Настройте Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
# Заполните переменные окружения в .env
npm start
```

4. **Настройте базу данных**
```bash
# Выполните миграции в Supabase SQL Editor
# Файлы миграций находятся в database/migrations/
```

### Переменные окружения

**Backend (.env)**
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
```

**Frontend (.env)**
```env
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_API_URL=http://localhost:3001/api
```

## 🎯 Использование

1. Откройте http://localhost:3000
2. Зарегистрируйтесь или войдите в систему
3. Создайте первый проект
4. Управляйте проектами, финансами и задачами

## 📱 Основные функции

### Дашборд
- Статистика по проектам и финансам
- Графики доходов и расходов
- Последние операции и задачи

### Проекты
- Создание проектов через пошаговую форму
- Детальная информация с вкладками
- Этапы, задачи, финансы
- Прогресс-бар выполнения

### Финансы
- Учет доходов и расходов
- Категоризация операций
- Графики и аналитика
- Экспорт отчетов

### Интерфейс
- Адаптивный дизайн для всех устройств
- Темная/светлая тема
- Интуитивная навигация
- Быстрый поиск и фильтры

## 🚀 Развертывание

### Production сборка
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend  
npm run build
npm start
```

### Docker (опционально)
```bash
docker-compose up -d
```

## 📋 Статус разработки

- [x] Базовая архитектура
- [x] Аутентификация
- [x] Модуль проектов (полный)
- [x] Финансовый модуль (базовый)
- [x] Современный UI/UX
- [ ] Модуль сотрудников
- [ ] Складской учет
- [ ] Сметы и формы КС
- [ ] Учет дефектов
- [ ] Документооборот
- [ ] OCR и поиск

## 🤝 Участие в разработке

1. Fork проект
2. Создайте feature ветку
3. Commit изменения
4. Push в ветку
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

Для вопросов и предложений создавайте Issues в репозитории.