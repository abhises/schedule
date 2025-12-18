/*
  Warnings:

  - A unique constraint covering the columns `[date,userId]` on the table `ScheduleEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `ScheduleBatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `ScheduleBatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDays` to the `ScheduleBatch` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ScheduleBatch_createdAt_idx";

-- AlterTable
ALTER TABLE "ScheduleBatch" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalDays" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "ScheduleBatch_startDate_endDate_idx" ON "ScheduleBatch"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntry_date_userId_key" ON "ScheduleEntry"("date", "userId");
