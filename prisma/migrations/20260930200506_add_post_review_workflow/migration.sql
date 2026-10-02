-- AlterTable
ALTER TABLE `Post` MODIFY `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `reviewedAt` DATETIME(3) NULL,
                     ADD COLUMN `reviewedBy` VARCHAR(191) NULL,
                     ADD COLUMN `rejectionNote` TEXT NULL;
