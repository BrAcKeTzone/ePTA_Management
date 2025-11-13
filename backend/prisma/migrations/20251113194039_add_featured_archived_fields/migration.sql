-- AlterTable
ALTER TABLE `announcement` ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Announcement_isFeatured_idx` ON `Announcement`(`isFeatured`);

-- CreateIndex
CREATE INDEX `Announcement_isArchived_idx` ON `Announcement`(`isArchived`);
