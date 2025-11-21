import { IsEnum } from 'class-validator';
import { LabAssignmentStatus } from '@prisma/client';

export class UpdateLabAssignmentDto {
  @IsEnum(LabAssignmentStatus)
  status!: LabAssignmentStatus;
}
