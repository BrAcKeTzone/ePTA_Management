/*
  Warnings:

  - Made the column `endTime` on table `meeting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `meeting` MODIFY `endTime` VARCHAR(191) NOT NULL;
