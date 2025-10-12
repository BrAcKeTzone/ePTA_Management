/*
  Warnings:

  - You are about to drop the column `academicYear` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `yearLevel` on the `student` table. All the data in the column will be lost.
  - Added the required column `yearEnrolled` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add yearEnrolled column with a temporary default
ALTER TABLE `student` ADD COLUMN `yearEnrolled` VARCHAR(191) NOT NULL DEFAULT '2024';

-- Step 2: Copy academicYear data to yearEnrolled (extract first year from "YYYY-YYYY" format)
UPDATE `student` SET `yearEnrolled` = SUBSTRING(`academicYear`, 1, 4);

-- Step 3: Drop the old columns
ALTER TABLE `student` 
    DROP COLUMN `academicYear`,
    DROP COLUMN `program`,
    DROP COLUMN `section`,
    DROP COLUMN `yearLevel`;

-- Step 4: Create index on yearEnrolled
CREATE INDEX `Student_yearEnrolled_idx` ON `Student`(`yearEnrolled`);
