/*
  Warnings:

  - The `status` column on the `LabAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LabAssignmentStatus" AS ENUM ('AWAITING_PICKUP', 'IN_TRANSIT', 'RECEIVED', 'PROCESSING', 'DONE');

-- AlterTable
ALTER TABLE "LabAssignment" DROP COLUMN "status",
ADD COLUMN     "status" "LabAssignmentStatus" NOT NULL DEFAULT 'AWAITING_PICKUP';
