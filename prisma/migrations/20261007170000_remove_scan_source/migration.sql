-- DropIndex
DROP INDEX `Scan_source_file_key` ON `Scan`;

-- AlterTable
ALTER TABLE `Scan` DROP COLUMN `source`;

-- CreateIndex
CREATE UNIQUE INDEX `Scan_file_key` ON `Scan`(`file`);

