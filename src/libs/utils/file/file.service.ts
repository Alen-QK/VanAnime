import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { LogService } from 'src/libs/core/log/log.service';
import * as process from 'node:process';

@Injectable()
export class FileService implements OnApplicationBootstrap {
  private readonly torrentFilePath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logService: LogService,
  ) {
    this.torrentFilePath =
      this.configService.get<string>('TORRENT_FILE_PATH') ||
      '/src/files/torrents';
  }

  onApplicationBootstrap() {
    if (!fs.existsSync(path.join(process.cwd(), this.torrentFilePath))) {
      fs.mkdirSync(path.join(process.cwd(), this.torrentFilePath), {
        recursive: true,
      });
      this.logService.log(`目录已创建: ${this.torrentFilePath}`);
    } else {
      this.logService.log(`目录已存在: ${this.torrentFilePath}`);
    }
  }
}
