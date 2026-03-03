import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from '@nestjs/common';
import { urlencoded } from 'express';
import * as bodyParser from 'body-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe());

  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS
  const allowedOrigins = [
    'http://localhost:3000',
    `https://www.inkleinelevators.com`
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );




  const config = new DocumentBuilder()
    .setTitle("Inkleinventor Backend Development Use Nest & Prisma")
    .setDescription("Inkleinventor Api Description")
    .setVersion("1.0")
    // .addTag("Inkleinventor Backend Development Use Nest.js")

    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Incleinventor Api Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  app.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));


  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🚀 Inkleinventor API is running!                   ║
    ║                                                       ║
    ║   📡 Server: http://localhost:${port}                ║
    ║   📚 Swagger: http://localhost:${port}/docs          ║
    ║   🔌 WebSocket: ws://localhost:${port}/socket/message║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
  `);

}



bootstrap();
