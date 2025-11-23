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
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
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
