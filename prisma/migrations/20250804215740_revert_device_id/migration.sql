/*
  Warnings:

  - A unique constraint covering the columns `[deviceId,sessionId]` on the table `AttendanceRecords` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `AttendanceRecords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AttendanceRecords` ADD COLUMN `deviceId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AttendanceRecords_deviceId_sessionId_key` ON `AttendanceRecords`(`deviceId`, `sessionId`);
