import { Module } from '@nestjs/common';
import { TestResultsController } from './test-results.controller';
import { TestResultsService } from './test-results.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TestResultsController],
  providers: [TestResultsService, PrismaService],
  exports: [TestResultsService],
})
export class TestResultsModule {}
