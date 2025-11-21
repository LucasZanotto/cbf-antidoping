-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN_CBF', 'FED_USER', 'CLUB_USER', 'LAB_USER', 'REGULATOR', 'AUDITOR');

-- CreateEnum
CREATE TYPE "AthleteStatus" AS ENUM ('ELIGIBLE', 'SUSPENDED', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "federationId" TEXT,
    "clubId" TEXT,
    "labId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Federation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Federation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "federationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL,
    "cbfCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "cpfHash" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "status" "AthleteStatus" NOT NULL DEFAULT 'ELIGIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteAffiliation" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "federationId" TEXT NOT NULL,
    "clubId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "AthleteAffiliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Federation_uf_key" ON "Federation"("uf");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_cbfCode_key" ON "Athlete"("cbfCode");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_cpfHash_key" ON "Athlete"("cpfHash");

-- CreateIndex
CREATE INDEX "AthleteAffiliation_athleteId_idx" ON "AthleteAffiliation"("athleteId");

-- CreateIndex
CREATE INDEX "AthleteAffiliation_federationId_idx" ON "AthleteAffiliation"("federationId");

-- CreateIndex
CREATE INDEX "AthleteAffiliation_clubId_idx" ON "AthleteAffiliation"("clubId");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_federationId_fkey" FOREIGN KEY ("federationId") REFERENCES "Federation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteAffiliation" ADD CONSTRAINT "AthleteAffiliation_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteAffiliation" ADD CONSTRAINT "AthleteAffiliation_federationId_fkey" FOREIGN KEY ("federationId") REFERENCES "Federation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteAffiliation" ADD CONSTRAINT "AthleteAffiliation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
