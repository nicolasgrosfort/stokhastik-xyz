-- AlterTable
ALTER TABLE `StoreItem` ADD COLUMN `slug` VARCHAR(191) NULL;

-- Backfill: temporary slug = id for existing rows, to edit manually afterwards
UPDATE `StoreItem` SET `slug` = `id` WHERE `slug` IS NULL;

-- AlterTable
ALTER TABLE `StoreItem` MODIFY COLUMN `slug` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `StoreItem_slug_key` ON `StoreItem`(`slug`);
