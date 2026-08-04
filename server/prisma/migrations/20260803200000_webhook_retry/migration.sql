-- Retry/dead-letter dos webhooks: controle de tentativas e agendamento.

-- AlterTable
ALTER TABLE `WebhookEvent` ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `nextRetryAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `WebhookEvent_status_nextRetryAt_idx` ON `WebhookEvent`(`status`, `nextRetryAt`);
