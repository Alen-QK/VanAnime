import { Global, Module } from '@nestjs/common';
import { QbittorrentService } from './qbittorrent.service';
import { ApiClientModule } from 'src/libs/core/apiClient/apiClient.module';

@Global()
@Module({
  imports: [
    ApiClientModule.forFeature([
      {
        serviceName: 'QbittorrentService',
        config: {
          // TODO: 考虑到环境变量在NestJS中的导入方式，这里默认启动命令中带有--env-file .env以便于.env先于NestJS加载。可能未来有重构考虑，变为更符合NestJS的规范。
          // https://docs.nestjs.com/techniques/configuration#custom-configuration-files
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
