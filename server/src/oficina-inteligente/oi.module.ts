import { Module } from '@nestjs/common';
import { OiController } from './oi.controller';
import { OiService } from './oi.service';
import { OiScrapeService } from './oi-scrape.service';

@Module({
  controllers: [OiController],
  providers:   [OiService, OiScrapeService],
})
export class OiModule {}
