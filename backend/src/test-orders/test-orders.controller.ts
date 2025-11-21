import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TestOrdersService } from './test-orders.service';
import { CreateTestOrderDto } from './dto/create-test-order.dto';
import { UpdateTestOrderDto } from './dto/update-test-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { TestOrderStatus } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('test-orders')
export class TestOrdersController {
  constructor(private readonly service: TestOrdersService) {}

  // POST /api/v1/test-orders
  @Post()
  create(@Body() dto: CreateTestOrderDto, @Req() req: any) {
    const user = req.user as any;
    return this.service.create(dto, user.sub);
  }

  // GET /api/v1/test-orders
  @Get()
  findAll(
    @Query('status') status?: TestOrderStatus,
    @Query('federationId') federationId?: string,
    @Query('clubId') clubId?: string,
    @Query('athleteId') athleteId?: string,
    @Query('matchId') matchId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const take = limit ? Number(limit) : 50;
    return this.service.findAll({
      status,
      federationId,
      clubId,
      athleteId,
      matchId,
      take,
      cursor: cursor || null,
    });
  }

  // GET /api/v1/test-orders/lookup?q=&limit=
  // Endpoint leve para selects (AsyncSelect no front)
  @Get('lookup')
  async lookup(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const items = await this.service.lookup({ q, take });
    return { items };
  }

  // GET /api/v1/test-orders/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // PATCH /api/v1/test-orders/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestOrderDto) {
    return this.service.update(id, dto);
  }
}
