/*
  Warnings:

  - You are about to drop the column `attachmentName` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentUrl` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `targetAudience` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `targetProgram` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `targetYearLevel` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `fundingGoal` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `progressPercentage` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `targetBeneficiaries` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `totalExpenses` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `totalRaised` on the `project` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Announcement_targetAudience_idx` ON `announcement`;

-- AlterTable
ALTER TABLE `announcement` DROP COLUMN `attachmentName`,
    DROP COLUMN `attachmentUrl`,
    DROP COLUMN `targetAudience`,
    DROP COLUMN `targetProgram`,
    DROP COLUMN `targetYearLevel`;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `fundingGoal`,
    DROP COLUMN `location`,
    DROP COLUMN `notes`,
    DROP COLUMN `progressPercentage`,
    DROP COLUMN `targetBeneficiaries`,
    DROP COLUMN `totalExpenses`,
    DROP COLUMN `totalRaised`;
