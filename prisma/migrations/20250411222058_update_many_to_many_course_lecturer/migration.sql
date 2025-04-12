/*
  Warnings:

  - You are about to drop the column `lecturerId` on the `course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `Course_lecturerId_fkey`;

-- DropIndex
DROP INDEX `Course_lecturerId_fkey` ON `course`;

-- AlterTable
ALTER TABLE `course` DROP COLUMN `lecturerId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `_CourseLecturers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CourseLecturers_AB_unique`(`A`, `B`),
    INDEX `_CourseLecturers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CourseLecturers` ADD CONSTRAINT `_CourseLecturers_A_fkey` FOREIGN KEY (`A`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CourseLecturers` ADD CONSTRAINT `_CourseLecturers_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
