-- CreateEnum
CREATE TYPE "TestReason" AS ENUM ('IN_COMPETITION', 'OUT_OF_COMPETITION', 'TARGETED', 'RANDOM');

-- CreateEnum
CREATE TYPE "TestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TestOrderStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'COLLECTING', 'SHIPPED', 'RECEIVED', 'ANALYZING', 'COMPLETED', 'VOID');

-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('URINE', 'BLOOD');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('SEALED', 'SHIPPED', 'RECEIVED', 'ANALYZING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TestOutcome" AS ENUM ('NEGATIVE', 'AAF', 'INCONCLUSIVE');

-- CreateEnum
CREATE TYPE "FinalResultStatus" AS ENUM ('CONFIRMED', 'UNDER_APPEAL', 'RETRACTED');

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "federationId" TEXT NOT NULL,
    "clubId" TEXT,
    "athleteId" TEXT,
    "matchId" TEXT,
    "reason" "TestReason" NOT NULL,
    "priority" "TestPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TestOrderStatus" NOT NULL DEFAULT 'REQUESTED',

    CONSTRAINT "TestOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "testOrderId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "SampleType" NOT NULL,
    "collectedAt" TIMESTAMP(3),
    "collectedByUserId" TEXT,
    "chainOfCustodyJson" JSONB,
    "status" "SampleStatus" NOT NULL DEFAULT 'SEALED',

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabAssignment" (
    "id" TEXT NOT NULL,
    "testOrderId" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "LabAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "outcome" "TestOutcome" NOT NULL,
    "detailsJson" JSONB,
    "finalStatus" "FinalResultStatus",
    "pdfReportUrl" TEXT,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_code_key" ON "Lab"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_code_key" ON "Sample"("code");

-- CreateIndex
CREATE INDEX "LabAssignment_labId_idx" ON "LabAssignment"("labId");

-- CreateIndex
CREATE INDEX "LabAssignment_testOrderId_idx" ON "LabAssignment"("testOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_sampleId_key" ON "TestResult"("sampleId");

-- CreateIndex
CREATE INDEX "TestResult_labId_idx" ON "TestResult"("labId");

-- CreateIndex
CREATE INDEX "TestResult_reportedAt_idx" ON "TestResult"("reportedAt");

-- AddForeignKey
ALTER TABLE "TestOrder" ADD CONSTRAINT "TestOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAssignment" ADD CONSTRAINT "LabAssignment_testOrderId_fkey" FOREIGN KEY ("testOrderId") REFERENCES "TestOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabAssignment" ADD CONSTRAINT "LabAssignment_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
