import { Module } from '@nestjs/common';
import { LabWebhookController } from './lab-webhook.controller';
import { TestResultsModule } from '../test-results/test-results.module';

@Module({
  imports: [TestResultsModule],      // <-- traz o service exportado
  controllers: [LabWebhookController],
})
export class IntegrationsModule {}
