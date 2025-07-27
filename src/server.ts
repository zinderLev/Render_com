import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static'; // Импортируем плагин для статических файлов

// Создаем экземпляр Fastify
const fastify = Fastify({
  logger: true // Включаем логирование для отладки
});

// Регистрация плагина @fastify/static
// Указываем корневой каталог для статических файлов.
// __dirname в скомпилированном JS (dist/server.js) будет указывать на папку dist.
// Поэтому нам нужно подняться на один уровень вверх (..)
// чтобы получить доступ к файлам в корне проекта (где лежит myform.html).
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..'), // Корневой каталог проекта
  prefix: '/', // Файлы будут доступны по корневому URL
  decorateReply: false // Отключить декоратор reply.sendFile, если он не нужен для других целей
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

// Маршрут для отдачи главной HTML-страницы (myform.html)
fastify.get('/', async (request, reply) => {
  // reply.sendFile() теперь доступен благодаря @fastify/static
  // Он будет искать 'myform.html' в корневом каталоге, указанном в root опции.
  return reply.sendFile('myform.html');
});

// Маршрут для обработки POST-запросов (наш "эхо"-сервис)
fastify.post<{ Body: EchoRequestData, Reply: EchoResponseData }>('/echo', async (request, reply) => {
  const receivedData: EchoRequestData = request.body;
  fastify.log.info('Received data:', receivedData);

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
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
