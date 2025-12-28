/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,startTime,endTime]` on the table `ScheduleEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ScheduleEntry_date_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntry_userId_date_startTime_endTime_key" ON "ScheduleEntry"("userId", "date", "startTime", "endTime");
