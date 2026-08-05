/*
  Warnings:

  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- `type` is backfilled to PURCHASE for pre-existing rows (all of them were Stripe purchases),
-- then the temporary default is dropped so the app must set it explicitly going forward.
ALTER TABLE `Transaction` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `storeItemId` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('PURCHASE', 'SPEND', 'REFUND', 'BONUS', 'ADJUSTMENT') NOT NULL DEFAULT 'PURCHASE',
    MODIFY `packId` VARCHAR(191) NULL,
    MODIFY `amount` INTEGER NULL,
    MODIFY `currency` VARCHAR(191) NULL DEFAULT 'chf',
    MODIFY `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'SUCCEEDED',
    MODIFY `stripePaymentIntentId` VARCHAR(191) NULL;

ALTER TABLE `Transaction` ALTER COLUMN `type` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `Transaction_storeItemId_idx` ON `Transaction`(`storeItemId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_storeItemId_fkey` FOREIGN KEY (`storeItemId`) REFERENCES `StoreItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
