# 🎫 Ticket Aggregator - Агрегатор Билетов

Современный веб-сайт для поиска и сравнения цен на авиабилеты, железнодорожные и автобусные билеты от различных поставщиков.

## ✨ Возможности

- 🔍 **Поиск билетов** по направлениям, датам и количеству пассажиров
- ✈️ **Множественные виды транспорта**: самолеты, поезда, автобусы
- 💰 **Сравнение цен** от разных поставщиков (Aviasales, Omio, Kiwi, Busfor)
- 🎯 **Умный поиск** с фильтрацией и сортировкой результатов
- 👤 **Система пользователей** с регистрацией и авторизацией
- 📱 **Адаптивный дизайн** для всех устройств
- 🔐 **Безопасность** с JWT токенами и валидацией данных
- 💳 **Интеграция с платежными системами**

## 🏗️ Архитектура

### Backend (Node.js + Express + TypeScript)
- **Сервер**: Express.js с TypeScript
- **База данных**: PostgreSQL
- **Аутентификация**: JWT токены
- **Валидация**: Joi
- **API**: RESTful архитектура

### Frontend (React + TypeScript + TailwindCSS)
- **Фреймворк**: React 18 с TypeScript
- **Стили**: TailwindCSS
- **Роутинг**: React Router
- **Состояние**: React Context + React Query
- **Сборка**: Vite

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- PostgreSQL 12+
- npm или yarn

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd ticket-aggregator
```

### 2. Установка зависимостей

```bash
# Установка всех зависимостей (backend + frontend)
npm run install:all
```

### 3. Настройка базы данных

1. Создайте PostgreSQL базу данных:
```sql
CREATE DATABASE ticket_aggregator;
```

2. Скопируйте файл переменных окружения:
```bash
cd backend
cp .env.example .env
```

3. Отредактируйте `.env` файл с вашими настройками:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_aggregator
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# API Keys (получите у поставщиков)
AVIASALES_API_KEY=your_aviasales_api_key
OMIO_API_KEY=your_omio_api_key
KIWI_API_KEY=your_kiwi_api_key
BUSFOR_API_KEY=your_busfor_api_key
```

4. Инициализируйте базу данных:
```bash
npm run setup:db
```

### 4. Запуск приложения

#### Режим разработки (одновременно backend + frontend)
```bash
npm run dev
```

#### Отдельный запуск

**Backend:**
```bash
cd backend
npm run dev
# Сервер запустится на http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm run dev
# Приложение запустится на http://localhost:3000
```

### 5. Проверка работоспособности

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 📁 Структура проекта

```
ticket-aggregator/
├── backend/                 # Backend сервер
│   ├── src/
│   │   ├── config/         # Конфигурация БД
│   │   ├── controllers/    # Контроллеры API
│   │   ├── middleware/     # Middleware (auth, validation)
│   │   ├── models/         # Модели данных
│   │   ├── routes/         # API маршруты
│   │   ├── services/       # Бизнес-логика
│   │   ├── types/          # TypeScript типы
│   │   └── utils/          # Утилиты
│   ├── database/           # Скрипты БД
│   └── package.json
├── frontend/                # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── contexts/       # React контексты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   ├── types/          # TypeScript типы
│   │   └── utils/          # Утилиты
│   └── package.json
├── package.json             # Корневой package.json
└── README.md
```

## 🔌 API Endpoints

### Аутентификация
- `POST /api/user/register` - Регистрация пользователя
- `POST /api/user/login` - Вход в систему
- `GET /api/user/profile` - Получение профиля
- `PUT /api/user/profile` - Обновление профиля

### Поиск билетов
- `POST /api/search` - Поиск билетов
- `GET /api/search/ticket/:id` - Детали билета
- `GET /api/search/providers` - Доступные поставщики
- `GET /api/search/popular-routes` - Популярные маршруты

### Бронирование
- `POST /api/booking` - Создание бронирования
- `GET /api/booking` - Список бронирований пользователя
- `GET /api/booking/:id` - Детали бронирования
- `PUT /api/booking/:id/cancel` - Отмена бронирования

### Платежи
- `POST /api/payment/process` - Обработка платежа
- `GET /api/payment/methods` - Способы оплаты
- `GET /api/payment/history` - История платежей

## 🔑 Получение API ключей

### Aviasales
1. Зарегистрируйтесь на [aviasales.com](https://aviasales.com)
2. Перейдите в раздел API
3. Создайте приложение и получите API ключ

### Omio
1. Зарегистрируйтесь на [omio.com](https://omio.com)
2. Обратитесь в поддержку для получения API доступа
3. Получите API ключ и базовый URL

### Kiwi
1. Зарегистрируйтесь на [kiwi.com](https://kiwi.com)
2. Перейдите в раздел для разработчиков
3. Создайте приложение и получите API ключ

### Busfor
1. Зарегистрируйтесь на [busfor.com](https://busfor.com)
2. Обратитесь в поддержку для получения API доступа
3. Получите API ключ и базовый URL

## 🛠️ Разработка

### Backend разработка

```bash
cd backend
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка проекта
npm run start        # Запуск production версии
```

### Frontend разработка

```bash
cd frontend
npm run dev          # Запуск dev сервера
npm run build        # Сборка проекта
npm run preview      # Предварительный просмотр сборки
```

### База данных

```bash
cd backend
npm run setup:db     # Инициализация БД
```

## 🧪 Тестирование

### Backend тесты
```bash
cd backend
npm test
```

### Frontend тесты
```bash
cd frontend
npm test
```

## 🚀 Production развертывание

### 1. Сборка проекта
```bash
npm run build
```

### 2. Настройка переменных окружения
Убедитесь, что все production переменные настроены в `.env` файле.

### 3. Запуск
```bash
npm start
```

### 4. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Безопасность

- **JWT токены** для аутентификации
- **Валидация** всех входящих данных
- **Rate limiting** для защиты от DDoS
- **Helmet** для защиты заголовков
- **CORS** настройки
- **Хеширование паролей** с bcrypt

## 📊 Мониторинг и логирование

- **Morgan** для логирования HTTP запросов
- **Health check** endpoint для мониторинга
- **Error handling** с детальными логами
- **Graceful shutdown** для корректного завершения

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [Issues](https://github.com/your-repo/issues)
2. Создайте новый Issue с описанием проблемы
3. Обратитесь к документации API

## 🙏 Благодарности

- [Express.js](https://expressjs.com/) - Backend фреймворк
- [React](https://reactjs.org/) - Frontend библиотека
- [TailwindCSS](https://tailwindcss.com/) - CSS фреймворк
- [PostgreSQL](https://www.postgresql.org/) - База данных
- [Vite](https://vitejs.dev/) - Сборщик

---

**Создано с ❤️ для путешественников**