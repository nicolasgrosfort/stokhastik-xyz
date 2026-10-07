-- CreateTable
CREATE TABLE `Scan` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `source` ENUM('PUBLIC', 'DATA') NOT NULL,
    `kind` ENUM('GLB', 'PLY') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `tags` JSON NOT NULL,
    `category` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `capturedAt` DATETIME(3) NULL,
    `sizeBytes` INTEGER NULL,
    `thumbnail` VARCHAR(191) NULL,
    `storeItemId` VARCHAR(191) NULL,
    `embedding` JSON NULL,
    `embeddingModel` VARCHAR(191) NULL,
    `embeddingHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Scan_slug_key`(`slug`),
    INDEX `Scan_storeItemId_idx`(`storeItemId`),
    UNIQUE INDEX `Scan_source_file_key`(`source`, `file`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Scan` ADD CONSTRAINT `Scan_storeItemId_fkey` FOREIGN KEY (`storeItemId`) REFERENCES `StoreItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
