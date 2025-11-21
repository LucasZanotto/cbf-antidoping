import { Module } from '@nestjs/common';
import { TestOrdersService } from './test-orders.service';
import { TestOrdersController } from './test-orders.controller';

@Module({
  controllers: [TestOrdersController],
  providers: [TestOrdersService],
  exports: [TestOrdersService],
})
export class TestOrdersModule {}