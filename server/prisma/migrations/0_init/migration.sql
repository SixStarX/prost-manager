-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `cpfcnpj` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `zip` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `number` VARCHAR(191) NULL,
    `complement` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `preferences` TEXT NULL,
    `initialHistory` TEXT NULL,
    `responsible` VARCHAR(191) NULL,
    `clientSignature` LONGTEXT NULL,
    `responsibleSignature` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `plate` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `color` VARCHAR(191) NULL,
    `mileage` INTEGER NULL,
    `chassis` VARCHAR(191) NULL,
    `renavam` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Checklist` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NULL,
    `protocol` VARCHAR(191) NULL,
    `protocolSeq` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'IN_SERVICE',
    `entryDate` DATETIME(3) NULL,
    `expectedDate` DATETIME(3) NULL,
    `exitDate` DATETIME(3) NULL,
    `responsible` VARCHAR(191) NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `clientPhone` VARCHAR(191) NULL,
    `clientMobile` VARCHAR(191) NULL,
    `clientPhone2` VARCHAR(191) NULL,
    `clientEmail` VARCHAR(191) NULL,
    `clientCpfCnpj` VARCHAR(191) NULL,
    `clientRg` VARCHAR(191) NULL,
    `clientNotes` TEXT NULL,
    `clientAddress` TEXT NULL,
    `clientNeighborhood` VARCHAR(191) NULL,
    `clientCity` VARCHAR(191) NULL,
    `clientState` VARCHAR(191) NULL,
    `clientZip` VARCHAR(191) NULL,
    `vBrand` VARCHAR(191) NULL,
    `vModel` VARCHAR(191) NULL,
    `vYear` INTEGER NULL,
    `vPlate` VARCHAR(191) NULL,
    `vColor` VARCHAR(191) NULL,
    `vChassis` VARCHAR(191) NULL,
    `kmIn` INTEGER NULL,
    `kmOut` INTEGER NULL,
    `fuelType` VARCHAR(191) NULL,
    `fuelLevel` INTEGER NULL,
    `externalAccessories` JSON NULL,
    `safetyEquipment` JSON NULL,
    `interiorTech` JSON NULL,
    `damageMarks` JSON NULL,
    `diagnosis` TEXT NULL,
    `requestedServices` TEXT NULL,
    `observations` TEXT NULL,
    `signCompanyName` VARCHAR(191) NULL,
    `signClientName` VARCHAR(191) NULL,
    `signCompanyImage` LONGTEXT NULL,
    `signClientImage` LONGTEXT NULL,
    `signedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Checklist_clientId_idx`(`clientId`),
    INDEX `Checklist_vehicleId_idx`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Diagnostic` (
    `id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `complaint` TEXT NULL,
    `obdCode` VARCHAR(191) NULL,
    `system` VARCHAR(191) NULL,
    `confidence` VARCHAR(191) NULL,
    `aiResult` TEXT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `vehicleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceOrder` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `notes` TEXT NULL,
    `oiId` VARCHAR(191) NULL,
    `oiTotal` DOUBLE NULL,
    `expectedDeliveryDate` DATETIME(3) NULL,
    `diagnosticId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServiceOrder_oiId_key`(`oiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportJob` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `total` INTEGER NOT NULL DEFAULT 0,
    `imported` INTEGER NOT NULL DEFAULT 0,
    `skipped` INTEGER NOT NULL DEFAULT 0,
    `errors` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DONE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OiSyncJob` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'api',
    `date` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'orders',
    `total` INTEGER NOT NULL DEFAULT 0,
    `created` INTEGER NOT NULL DEFAULT 0,
    `updated` INTEGER NOT NULL DEFAULT 0,
    `skipped` INTEGER NOT NULL DEFAULT 0,
    `errors` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DONE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NOT NULL,
    `payload` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RECEIVED',
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Checklist` ADD CONSTRAINT `Checklist_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Checklist` ADD CONSTRAINT `Checklist_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diagnostic` ADD CONSTRAINT `Diagnostic_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrder` ADD CONSTRAINT `ServiceOrder_diagnosticId_fkey` FOREIGN KEY (`diagnosticId`) REFERENCES `Diagnostic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

