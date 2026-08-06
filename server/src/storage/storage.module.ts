import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesController } from './files.controller';

// Global: StorageService pode ser injetado em qualquer service (checklists etc.).
@Global()
@Module({
  controllers: [FilesController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
