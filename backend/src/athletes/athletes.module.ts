// src/athletes/athletes.module.ts
import { Module } from '@nestjs/common';
import { AthletesController } from './athletes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AthletesController],
})
export class AthletesModule {}
