import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Prefixo global ONCE
  app.setGlobalPrefix('api/v1');

  // CORS – adiciona depois a URL real do frontend na Render
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      // coloque aqui depois a URL do seu frontend na Render, ex:
      // 'https://cbf-antidoping-web.onrender.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false, // ok para JWT via header
  });

  // seed do admin
  const usersService = app.get(UsersService);
  await usersService.createInitialAdminIfNotExists();

  // Render define a porta via env
  const port = process.env.PORT || 3000;
  await app.listen(port as number, '0.0.0.0');
}

bootstrap();
