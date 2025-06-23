// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import 'reflect-metadata';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);


//     app.setGlobalPrefix("api/v1");

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     })
//   );
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // 👈 importar cookie-parser
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Global prefix
  app.setGlobalPrefix('api/v1');

  // 👇 Permitir cookies cross-origin desde el frontend
  app.enableCors({
    origin: 'http://localhost:3000', // ⚠️ Usa el puerto correcto de tu frontend
    credentials: true,               // 👈 Necesario para enviar cookies
  });

  // 👇 Usar cookie-parser para leer cookies (como refreshToken)
  app.use(cookieParser());

  // 👇 Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
