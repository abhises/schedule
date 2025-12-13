/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ScheduleBatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScheduleEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_batchId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_userId_fkey";

-- AlterTable
ALTER TABLE "ScheduleBatch" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "privateMetadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "publicMetadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "subscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ScheduleBatch_status_idx" ON "ScheduleBatch"("status");

-- CreateIndex
CREATE INDEX "ScheduleBatch_createdAt_idx" ON "ScheduleBatch"("createdAt");

-- CreateIndex
CREATE INDEX "ScheduleEntry_userId_idx" ON "ScheduleEntry"("userId");

-- CreateIndex
CREATE INDEX "ScheduleEntry_batchId_idx" ON "ScheduleEntry"("batchId");

-- CreateIndex
CREATE INDEX "ScheduleEntry_date_idx" ON "ScheduleEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ScheduleBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
