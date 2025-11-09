/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Meeting` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `qrScanLocation` VARCHAR(191) NULL,
    ADD COLUMN `qrScannedAt` DATETIME(3) NULL,
    ADD COLUMN `scannedViaQR` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `meeting` ADD COLUMN `qrCode` VARCHAR(191) NULL,
    ADD COLUMN `qrCodeActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `qrCodeExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `qrCodeGeneratedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Meeting_qrCode_key` ON `Meeting`(`qrCode`);
