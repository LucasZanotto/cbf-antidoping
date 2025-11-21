import { Controller, Get, Query } from '@nestjs/common';
import { ClubsService } from './clubs.service';

@Controller('clubs')
export class ClubsController {
  constructor(private service: ClubsService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('federationId') federationId?: string,
    @Query('limit') limit?: string,
  ) {
    const items = await this.service.search({ q, federationId, limit: Number(limit) || 10 });
    return { items, pageInfo: { hasNextPage: false, nextCursor: null } };
  }
}
