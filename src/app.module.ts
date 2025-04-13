import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryModule } from './modules/query/query.module';
import { SourcesModule } from './libs/sources/sources.module';
import { LogService } from './libs/core/log/log.service';
import { LogModule } from './libs/core/log/log.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalCacheModule } from './libs/core/cache/cache.module';
import { DownloaderModule } from './modules/downloader/downloader.module';
import { QbittorrentModule } from './libs/utils/qbittorrent/qbittorrent.module';
import { MagnetModule } from './libs/utils/magnet/magnet.module';
import { FileModule } from './libs/core/file/file.module';
import { StoreModule } from './libs/core/store/store.module';

@Module({
  imports: [
    QueryModule,
    SourcesModule,
    LogModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GlobalCacheModule,
    DownloaderModule,
    QbittorrentModule,
    MagnetModule,
    FileModule,
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, LogService],
  exports: [GlobalCacheModule, QbittorrentModule],
})
export class AppModule {}
