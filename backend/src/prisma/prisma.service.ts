import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // Versão simples suficiente por enquanto.
  // Se quiser o hook de shutdown depois, a gente adiciona com cast.
}
