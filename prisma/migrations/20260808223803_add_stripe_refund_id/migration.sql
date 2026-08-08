-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `stripeRefundId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_stripeRefundId_key` ON `Transaction`(`stripeRefundId`);

