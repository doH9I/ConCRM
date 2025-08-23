#!/bin/bash

echo "🚀 Запуск Ticket Aggregator..."

# Проверяем наличие Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Проверяем, запущен ли Docker
if ! docker info &> /dev/null; then
    echo "❌ Docker не запущен. Пожалуйста, запустите Docker."
    exit 1
fi

echo "✅ Docker и Docker Compose доступны"

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down

# Удаляем старые образы (опционально)
read -p "🗑️  Удалить старые образы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Удаляем старые образы..."
    docker-compose down --rmi all
fi

# Собираем и запускаем контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose up --build -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 30

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose ps

echo ""
echo "🎉 Ticket Aggregator запущен!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo "📊 Nginx: http://localhost:80"
echo ""
echo "📝 Логи: docker-compose logs -f"
echo "🛑 Остановка: docker-compose down"
echo ""
echo "🔍 Проверка работоспособности..."
echo "Health Check: http://localhost/health"