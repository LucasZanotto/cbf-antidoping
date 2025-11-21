import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SamplesService } from './samples.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('samples')
export class SamplesController {
  constructor(private service: SamplesService) {}

  /**
   * GET /samples
   * Unificado: suporta q, type, status, testOrderId, code, limit, cursor
   */
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('testOrderId') testOrderId?: string,
    @Query('code') code?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.list({
      q,
      type,
      status,
      testOrderId,
      code,
      cursor,
      limit: Number(limit) || 20,
    });
  }

  @Post()
  create(@Body() dto: CreateSampleDto) {
    return this.service.create(dto);
  }

  /**
   * GET /samples/lookup
   * Para selects assíncronos do front (filtra por q e testOrderId)
   * Importante: declarado ANTES do :id
   */
  @Get('lookup')
  async lookup(
    @Query('q') q?: string,
    @Query('testOrderId') testOrderId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.lookup({
      q,
      testOrderId,
      limit: Math.min(Number(limit) || 10, 50),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSampleDto) {
    return this.service.update(id, dto);
  }
}
