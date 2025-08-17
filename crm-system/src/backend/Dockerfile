# Использовать Node.js 18 Alpine как базовый образ
FROM node:18-alpine

# Установить рабочую директорию
WORKDIR /app

# Скопировать файлы пакетов
COPY package*.json ./

# Установить зависимости
RUN npm ci --only=production && npm cache clean --force

# Скопировать исходный код
COPY . .

# Собрать приложение
RUN npm run build

# Удалить зависимости для разработки
RUN npm prune --production

# Создать пользователя без прав root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Изменить владельца директории приложения
RUN chown -R nestjs:nodejs /app
USER nestjs

# Открыть порт
EXPOSE 3001

# Проверка состояния
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Запустить приложение
CMD ["npm", "run", "start:prod"]