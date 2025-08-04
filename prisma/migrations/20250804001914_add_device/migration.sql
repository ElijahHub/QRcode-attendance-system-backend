/*
  Warnings:

  - You are about to drop the column `deviceId` on the `AttendanceRecords` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `AttendanceRecords_deviceId_sessionId_key` ON `AttendanceRecords`;

-- AlterTable
ALTER TABLE `AttendanceRecords` DROP COLUMN `deviceId`;
