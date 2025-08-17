const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3001,
  path: '/health',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  console.log(`Статус проверки состояния: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('Проверка состояния не удалась:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('Таймаут проверки состояния');
  request.destroy();
  process.exit(1);
});

request.end();