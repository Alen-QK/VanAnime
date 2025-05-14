import { Global, Module } from '@nestjs/common';
import { QbittorrentService } from './qbittorrent.service';
import { ApiServiceModule } from 'src/libs/apiAxios/apiService.module';

@Global()
@Module({
  imports: [
    ApiServiceModule.forFeature([
      {
        serviceName: 'QbittorrentService',
        config: {
          baseURL: process.env.QB_HOST,
          enableLogs: true,
        },
      },
    ]),
  ],
  providers: [QbittorrentService],
  exports: [QbittorrentService],
})
export class QbittorrentModule {}
