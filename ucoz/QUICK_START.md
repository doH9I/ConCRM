# 🚀 Быстрый запуск на uCoz

## 📋 Что нужно сделать за 10 минут:

### 1. Создать сайт на uCoz
- Зайдите на [ucoz.ru](https://ucoz.ru)
- Создайте новый сайт
- Запомните домен (например: `yoursite.ucoz.net`)

### 2. Создать базу данных
- В панели uCoz → **"База данных"**
- Создайте MySQL базу данных
- Запомните: имя БД, пользователь, пароль

### 3. Загрузить файлы
- В панели uCoz → **"Файловый менеджер"**
- Создайте папки: `js/`, `backend/config/`, `backend/api/user/`, `backend/api/search/`
- Загрузите все файлы из папки `ucoz/`

### 4. Настроить базу данных
- uCoz → **"База данных"** → **"phpMyAdmin"**
- Выберите вашу БД → вкладка **"SQL"**
- Вставьте содержимое `backend/database/setup.sql` и выполните

### 5. Настроить конфигурацию
- Откройте `backend/config/database.php`
- Замените данные на ваши:
  ```php
  private $db_name = 'ВАША_БАЗА_ДАННЫХ';
  private $username = 'ВАШ_ПОЛЬЗОВАТЕЛЬ';
  private $password = 'ВАШ_ПАРОЛЬ';
  ```

- В `frontend/js/app.js` замените:
  ```javascript
  const API_BASE_URL = 'https://ВАШ_ДОМЕН.ucoz.net/backend/api';
  ```

### 6. Готово! 🎉
Откройте ваш сайт и тестируйте функциональность.

## 🔧 Структура файлов на uCoz:
```
public_html/
├── index.html
├── search-results.html
├── js/
│   ├── app.js
│   └── search-results.js
└── backend/
    ├── config/
    │   ├── config.php
    │   └── database.php
    ├── database/
    │   └── setup.sql
    └── api/
        ├── user/
        │   ├── register.php
        │   ├── login.php
        │   └── verify-token.php
        └── search/
            └── search.php
```

## ⚠️ Важно:
- Все файлы должны быть в папке `public_html/`
- Проверьте права доступа к файлам
- В случае ошибок проверьте логи в панели uCoz

## 🆘 Если что-то не работает:
1. Проверьте правильность данных в `database.php`
2. Убедитесь, что все файлы загружены
3. Проверьте логи ошибок в панели uCoz
4. Убедитесь, что база данных создана и таблицы существуют

**Удачи! 🚀**