import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LabAssignmentsService } from './lab-assignments.service';
import { CreateLabAssignmentDto } from './dto/create-lab-assignment.dto';
import { UpdateLabAssignmentDto } from './dto/update-lab-assignment.dto';
import { LabAssignmentStatus } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('lab-assignments')
export class LabAssignmentsController {
  constructor(private service: LabAssignmentsService) {}

  @Post()
  create(@Body() dto: CreateLabAssignmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('labId') labId?: string,
    @Query('status') status?: LabAssignmentStatus,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.service.findAll({
      q,
      labId,
      status,
      limit: limit ? Number(limit) : 20,
      cursor: cursor || null,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLabAssignmentDto) {
    return this.service.update(id, dto);
  }
}
