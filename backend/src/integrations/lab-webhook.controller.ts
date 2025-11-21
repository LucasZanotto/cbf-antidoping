import { Controller, Param, Post, Body } from '@nestjs/common';
import { TestResultsService } from '../test-results/test-results.service';
import { CreateTestResultDto } from '../test-results/dto/create-test-result.dto';

@Controller('integrations/labs')
export class LabWebhookController {
  constructor(private readonly testResultsService: TestResultsService) {}

  @Post(':labId/results')
  async receiveResult(
    @Param('labId') labId: string,
    @Body() body: Omit<CreateTestResultDto, 'labId'>,
  ) {
    return this.testResultsService.create({
      ...body,
      labId,
    });
  }
}
