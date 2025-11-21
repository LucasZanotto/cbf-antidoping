import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Prefixo global ONCE
  app.setGlobalPrefix('api/v1');

  // CORS para o Vite
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false, // ok para JWT via header. Se usar cookies/samesite no futuro, troque para true.
  });

  // seed do admin
  const usersService = app.get(UsersService);
  await usersService.createInitialAdminIfNotExists();

  await app.listen(3000);
}
bootstrap();
