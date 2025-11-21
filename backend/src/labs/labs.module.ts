import { Module } from '@nestjs/common';
import { LabsController } from './labs.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LabsController],
  providers: [PrismaService],
  exports: [],
})
export class LabsModule {}
