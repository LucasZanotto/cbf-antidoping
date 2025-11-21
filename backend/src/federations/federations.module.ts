import { Module } from '@nestjs/common';
import { FederationsController } from './federations.controller';
import { FederationsService } from './federations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FederationsController],
  providers: [FederationsService],
  exports: [FederationsService],
})
export class FederationsModule {}
