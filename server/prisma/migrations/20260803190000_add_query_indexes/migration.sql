-- Índices para as colunas consultadas por findFirst na sincronização
-- (scrape/webhook). Evitam full table scan à medida que o volume cresce.

-- CreateIndex
CREATE INDEX `Client_name_idx` ON `Client`(`name`);

-- CreateIndex
CREATE INDEX `Client_cpfcnpj_idx` ON `Client`(`cpfcnpj`);

-- CreateIndex
CREATE INDEX `Vehicle_plate_idx` ON `Vehicle`(`plate`);
