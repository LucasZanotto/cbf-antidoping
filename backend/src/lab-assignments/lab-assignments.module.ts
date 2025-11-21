import { Module } from '@nestjs/common';
import { LabAssignmentsController } from './lab-assignments.controller';
import { LabAssignmentsService } from './lab-assignments.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LabAssignmentsController],
  providers: [LabAssignmentsService, PrismaService],
  exports: [LabAssignmentsService],
})
export class LabAssignmentsModule {}
