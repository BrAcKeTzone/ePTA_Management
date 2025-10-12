/*
  Warnings:

  - You are about to drop the column `email` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Student_email_key` ON `student`;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `email`,
    DROP COLUMN `phone`;
