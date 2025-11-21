import { Controller, Get, Query } from '@nestjs/common';
import { FederationsService } from './federations.service';

@Controller('federations') // sem api/v1 aqui, pq já tem setGlobalPrefix
export class FederationsController {
  constructor(private service: FederationsService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    const items = await this.service.search({ q, limit: Number(limit) || 10 });
    return { items, pageInfo: { hasNextPage: false, nextCursor: null } };
  }
}
