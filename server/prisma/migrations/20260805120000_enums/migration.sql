-- Converte colunas String para ENUM (integridade a nível de banco).
-- Seguro: os valores existentes foram auditados e estão todos dentro do conjunto.

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `Diagnostic` MODIFY `source` ENUM('manual', 'ai') NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE `WebhookEvent` MODIFY `status` ENUM('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED', 'DEAD') NOT NULL DEFAULT 'RECEIVED';
