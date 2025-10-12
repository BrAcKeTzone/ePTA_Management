/*
  Warnings:

  - You are about to drop the column `date` on the `contribution` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `student` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `student` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.
  - A unique constraint covering the columns `[studentId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `balance` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venue` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `Penalty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `announcement` ADD COLUMN `attachmentName` VARCHAR(191) NULL,
    ADD COLUMN `attachmentUrl` VARCHAR(191) NULL,
    ADD COLUMN `expiryDate` DATETIME(3) NULL,
    ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN `publishDate` DATETIME(3) NULL,
    ADD COLUMN `targetAudience` ENUM('ALL', 'PARENTS', 'ADMINS', 'SPECIFIC_PROGRAM', 'SPECIFIC_YEAR_LEVEL') NOT NULL DEFAULT 'ALL',
    ADD COLUMN `targetProgram` VARCHAR(191) NULL,
    ADD COLUMN `targetYearLevel` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `checkInTime` DATETIME(3) NULL,
    ADD COLUMN `checkOutTime` DATETIME(3) NULL,
    ADD COLUMN `excuseReason` TEXT NULL,
    ADD COLUMN `isLate` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lateMinutes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `penaltyAmount` DOUBLE NULL,
    ADD COLUMN `penaltyApplied` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `penaltyAppliedAt` DATETIME(3) NULL,
    ADD COLUMN `remarks` TEXT NULL,
    MODIFY `status` ENUM('PRESENT', 'ABSENT', 'EXCUSED') NOT NULL DEFAULT 'ABSENT';

-- AlterTable
ALTER TABLE `contribution` DROP COLUMN `date`,
    ADD COLUMN `academicYear` VARCHAR(191) NULL,
    ADD COLUMN `adjustmentAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `adjustmentReason` TEXT NULL,
    ADD COLUMN `amountPaid` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `balance` DOUBLE NOT NULL,
    ADD COLUMN `daysOverdue` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `isOverdue` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPaid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isWaived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastReminderDate` DATETIME(3) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'GCASH', 'PAYMAYA', 'CHECK', 'OTHER') NULL,
    ADD COLUMN `paymentNotes` TEXT NULL,
    ADD COLUMN `paymentReference` VARCHAR(191) NULL,
    ADD COLUMN `period` VARCHAR(191) NULL,
    ADD COLUMN `reminderCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `reminderSent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reminderSentAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('MONTHLY', 'PROJECT', 'SPECIAL', 'DONATION', 'MEMBERSHIP', 'EVENT') NOT NULL,
    ADD COLUMN `waivedAt` DATETIME(3) NULL,
    ADD COLUMN `waivedBy` INTEGER NULL,
    ADD COLUMN `waiverReason` TEXT NULL;

-- AlterTable
ALTER TABLE `meeting` ADD COLUMN `actualAttendees` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `agenda` TEXT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `endTime` VARCHAR(191) NULL,
    ADD COLUMN `expectedAttendees` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `isVirtual` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `meetingLink` VARCHAR(191) NULL,
    ADD COLUMN `meetingType` ENUM('GENERAL', 'SPECIAL', 'EMERGENCY', 'COMMITTEE', 'ANNUAL', 'QUARTERLY') NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN `minutesAddedAt` DATETIME(3) NULL,
    ADD COLUMN `minutesAddedBy` INTEGER NULL,
    ADD COLUMN `notificationSent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notificationSentAt` DATETIME(3) NULL,
    ADD COLUMN `quorumPercentage` DOUBLE NULL,
    ADD COLUMN `quorumReached` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reminderSent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reminderSentAt` DATETIME(3) NULL,
    ADD COLUMN `startTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED') NOT NULL DEFAULT 'SCHEDULED',
    ADD COLUMN `venue` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `penalty` ADD COLUMN `amountPaid` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `balance` DOUBLE NOT NULL,
    ADD COLUMN `daysOverdue` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `discountAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `discountReason` TEXT NULL,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `isOverdue` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isWaived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastReminderDate` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'GCASH', 'PAYMAYA', 'CHECK', 'OTHER') NULL,
    ADD COLUMN `paymentNotes` TEXT NULL,
    ADD COLUMN `paymentReference` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'WAIVED', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN `reminderCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `reminderSent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reminderSentAt` DATETIME(3) NULL,
    ADD COLUMN `waivedAt` DATETIME(3) NULL,
    ADD COLUMN `waivedBy` INTEGER NULL,
    ADD COLUMN `waiverReason` TEXT NULL,
    MODIFY `reason` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `project` ADD COLUMN `attachments` TEXT NULL,
    ADD COLUMN `balance` DOUBLE NOT NULL,
    ADD COLUMN `completedDate` DATETIME(3) NULL,
    ADD COLUMN `fundingGoal` DOUBLE NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN `progressPercentage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNING',
    ADD COLUMN `targetBeneficiaries` INTEGER NULL,
    ADD COLUMN `totalExpenses` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalRaised` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `venue` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `grade`,
    DROP COLUMN `name`,
    ADD COLUMN `academicYear` VARCHAR(191) NOT NULL DEFAULT '2024-2025',
    ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `enrollmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `linkStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `program` VARCHAR(191) NOT NULL DEFAULT 'Not Specified',
    ADD COLUMN `section` VARCHAR(191) NULL,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL,
    ADD COLUMN `yearLevel` VARCHAR(191) NOT NULL DEFAULT '1',
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    MODIFY `parentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `MeetingAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `uploadedBy` INTEGER NOT NULL,
    `meetingId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MeetingAttachment_meetingId_idx`(`meetingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenaltyPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'GCASH', 'PAYMAYA', 'CHECK', 'OTHER') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `penaltyId` INTEGER NOT NULL,
    `recordedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PenaltyPayment_penaltyId_idx`(`penaltyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectExpense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `amount` DOUBLE NOT NULL,
    `category` VARCHAR(191) NULL,
    `expenseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receipt` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `recordedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProjectExpense_projectId_idx`(`projectId`),
    INDEX `ProjectExpense_expenseDate_idx`(`expenseDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectUpdate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `isMilestone` BOOLEAN NOT NULL DEFAULT false,
    `attachments` TEXT NULL,
    `postedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProjectUpdate_projectId_idx`(`projectId`),
    INDEX `ProjectUpdate_isMilestone_idx`(`isMilestone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContributionPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'GCASH', 'PAYMAYA', 'CHECK', 'OTHER') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `contributionId` INTEGER NOT NULL,
    `recordedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContributionPayment_contributionId_idx`(`contributionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnnouncementRead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `announcementId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnnouncementRead_userId_idx`(`userId`),
    INDEX `AnnouncementRead_announcementId_idx`(`announcementId`),
    UNIQUE INDEX `AnnouncementRead_announcementId_userId_key`(`announcementId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `penaltyRatePerAbsence` DOUBLE NOT NULL DEFAULT 50.00,
    `penaltyRateLate` DOUBLE NOT NULL DEFAULT 25.00,
    `penaltyGracePeriodDays` INTEGER NOT NULL DEFAULT 7,
    `enableAutoPenalty` BOOLEAN NOT NULL DEFAULT true,
    `monthlyContributionAmount` DOUBLE NOT NULL DEFAULT 100.00,
    `projectContributionMinimum` DOUBLE NOT NULL DEFAULT 50.00,
    `enableMandatoryContribution` BOOLEAN NOT NULL DEFAULT true,
    `paymentBasis` VARCHAR(191) NOT NULL DEFAULT 'PER_STUDENT',
    `allowPartialPayment` BOOLEAN NOT NULL DEFAULT true,
    `paymentDueDays` INTEGER NOT NULL DEFAULT 30,
    `minimumMeetingsPerYear` INTEGER NOT NULL DEFAULT 4,
    `quorumPercentage` DOUBLE NOT NULL DEFAULT 50.0,
    `notificationDaysBeforeMeet` INTEGER NOT NULL DEFAULT 7,
    `documentCategories` TEXT NOT NULL,
    `currentAcademicYear` VARCHAR(191) NOT NULL DEFAULT '2024-2025',
    `academicYearStart` VARCHAR(191) NOT NULL DEFAULT '08-01',
    `academicYearEnd` VARCHAR(191) NOT NULL DEFAULT '07-31',
    `systemName` VARCHAR(191) NOT NULL DEFAULT 'JHCSC Dumingag Campus PTA',
    `systemEmail` VARCHAR(191) NOT NULL DEFAULT 'pta@jhcsc.edu.ph',
    `systemPhone` VARCHAR(191) NULL DEFAULT '+639123456789',
    `enableEmailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `enableSMSNotifications` BOOLEAN NOT NULL DEFAULT false,
    `updatedById` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Settings_key_key`(`key`),
    INDEX `Settings_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Announcement_isPublished_idx` ON `Announcement`(`isPublished`);

-- CreateIndex
CREATE INDEX `Announcement_publishDate_idx` ON `Announcement`(`publishDate`);

-- CreateIndex
CREATE INDEX `Announcement_targetAudience_idx` ON `Announcement`(`targetAudience`);

-- CreateIndex
CREATE INDEX `Attendance_status_idx` ON `Attendance`(`status`);

-- CreateIndex
CREATE INDEX `Attendance_meetingId_idx` ON `Attendance`(`meetingId`);

-- CreateIndex
CREATE INDEX `Attendance_hasPenalty_idx` ON `Attendance`(`hasPenalty`);

-- CreateIndex
CREATE INDEX `Contribution_type_idx` ON `Contribution`(`type`);

-- CreateIndex
CREATE INDEX `Contribution_status_idx` ON `Contribution`(`status`);

-- CreateIndex
CREATE INDEX `Contribution_isPaid_idx` ON `Contribution`(`isPaid`);

-- CreateIndex
CREATE INDEX `Contribution_isOverdue_idx` ON `Contribution`(`isOverdue`);

-- CreateIndex
CREATE INDEX `Contribution_dueDate_idx` ON `Contribution`(`dueDate`);

-- CreateIndex
CREATE INDEX `Contribution_academicYear_idx` ON `Contribution`(`academicYear`);

-- CreateIndex
CREATE INDEX `Meeting_date_idx` ON `Meeting`(`date`);

-- CreateIndex
CREATE INDEX `Meeting_status_idx` ON `Meeting`(`status`);

-- CreateIndex
CREATE INDEX `Meeting_meetingType_idx` ON `Meeting`(`meetingType`);

-- CreateIndex
CREATE INDEX `Penalty_paymentStatus_idx` ON `Penalty`(`paymentStatus`);

-- CreateIndex
CREATE INDEX `Penalty_isPaid_idx` ON `Penalty`(`isPaid`);

-- CreateIndex
CREATE INDEX `Penalty_isOverdue_idx` ON `Penalty`(`isOverdue`);

-- CreateIndex
CREATE INDEX `Penalty_dueDate_idx` ON `Penalty`(`dueDate`);

-- CreateIndex
CREATE INDEX `Project_status_idx` ON `Project`(`status`);

-- CreateIndex
CREATE INDEX `Project_priority_idx` ON `Project`(`priority`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_studentId_key` ON `Student`(`studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_email_key` ON `Student`(`email`);

-- CreateIndex
CREATE INDEX `Student_studentId_idx` ON `Student`(`studentId`);

-- CreateIndex
CREATE INDEX `Student_lastName_firstName_idx` ON `Student`(`lastName`, `firstName`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_isActive_idx` ON `User`(`isActive`);

-- AddForeignKey
ALTER TABLE `MeetingAttachment` ADD CONSTRAINT `MeetingAttachment_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenaltyPayment` ADD CONSTRAINT `PenaltyPayment_penaltyId_fkey` FOREIGN KEY (`penaltyId`) REFERENCES `Penalty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectExpense` ADD CONSTRAINT `ProjectExpense_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectUpdate` ADD CONSTRAINT `ProjectUpdate_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContributionPayment` ADD CONSTRAINT `ContributionPayment_contributionId_fkey` FOREIGN KEY (`contributionId`) REFERENCES `Contribution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnnouncementRead` ADD CONSTRAINT `AnnouncementRead_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settings` ADD CONSTRAINT `Settings_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `attendance` RENAME INDEX `Attendance_parentId_fkey` TO `Attendance_parentId_idx`;

-- RenameIndex
ALTER TABLE `contribution` RENAME INDEX `Contribution_parentId_fkey` TO `Contribution_parentId_idx`;

-- RenameIndex
ALTER TABLE `contribution` RENAME INDEX `Contribution_projectId_fkey` TO `Contribution_projectId_idx`;

-- RenameIndex
ALTER TABLE `meeting` RENAME INDEX `Meeting_createdById_fkey` TO `Meeting_createdById_idx`;

-- RenameIndex
ALTER TABLE `penalty` RENAME INDEX `Penalty_meetingId_fkey` TO `Penalty_meetingId_idx`;

-- RenameIndex
ALTER TABLE `penalty` RENAME INDEX `Penalty_parentId_fkey` TO `Penalty_parentId_idx`;

-- RenameIndex
ALTER TABLE `project` RENAME INDEX `Project_createdById_fkey` TO `Project_createdById_idx`;

-- RenameIndex
ALTER TABLE `student` RENAME INDEX `Student_parentId_fkey` TO `Student_parentId_idx`;
