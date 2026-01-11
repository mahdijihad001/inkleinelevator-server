import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
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

  // Increase payload size limit for file uploads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));


  const config = new DocumentBuilder()
    .setTitle("Inkleinventor Full Api Docs")
    .setDescription("Inkleinventor Api Description")
    .setVersion("1.0")
    .addTag("Inkleinventor Backend Development Use Nest.js")

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


  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🚀 Inkleinventor API is running!                    ║
    ║                                                       ║
    ║   📡 Server: http://localhost:${port}                ║
    ║   📚 Swagger: http://localhost:${port}/docs          ║
    ║   🔌 WebSocket: ws://localhost:${port}/notifications ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
  `);

}



bootstrap();
