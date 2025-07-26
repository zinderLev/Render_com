import Fastify from 'fastify';
import path from 'path';
import view from '@fastify/view'; // Импортируем плагин для view
import * as ejs from 'ejs';       // Импортируем EJS напрямую

// Создаем экземпляр Fastify
const fastify = Fastify({
  logger: true // Включаем логирование для отладки
});

// Регистрация плагина @fastify/view для работы с EJS
fastify.register(view, {
  engine: {
    ejs: ejs // Указываем, что используем EJS
  },
  root: path.join(__dirname, '..', 'views') // Путь к папке с шаблонами
});

// Типизация для данных, которые мы ожидаем получить из формы
interface EchoRequestData {
  message: string;
  name?: string; // name опционален
}

// Типизация для данных, которые мы будем отправлять в ответе
interface EchoResponseData {
  success: boolean;
  echo: EchoRequestData;
  timestamp: string;
}

// Маршрут для отдачи главной HTML-страницы с формой
fastify.get('/', async (request, reply) => {
  // reply.view рендерит шаблон EJS
  return reply.view('index.ejs', { message: 'Введите что-нибудь и отправьте!' });
});

// Маршрут для обработки POST-запросов (наш "эхо"-сервис)
fastify.post<{ Body: EchoRequestData, Reply: EchoResponseData }>('/echo', async (request, reply) => {
  // request.body теперь типизирован благодаря дженерику в post методе
  const receivedData: EchoRequestData = request.body;
  fastify.log.info('Received data:', receivedData); // Используем логгер Fastify

  // Отправляем полученные данные обратно клиенту в JSON-формате
  reply.send({
    success: true,
    echo: receivedData,
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
const start = async () => {
  try {
    const PORT: number = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port: PORT, host: '0.0.0.0' }); // 0.0.0.0 для совместимости с Render.com
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
