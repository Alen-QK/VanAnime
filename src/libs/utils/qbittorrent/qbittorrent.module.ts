import { Global, Module } from '@nestjs/common';
import { QbittorrentService } from './qbittorrent.service';

@Global()
@Module({
  imports: [],
  providers: [QbittorrentService],
  exports: [QbittorrentService],
})
export class QbittorrentModule {}
