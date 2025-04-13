import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LogService } from '../log/log.service';
import * as process from 'node:process';
import { STORE_PATH, TORRENT_FILE_PATH } from '../../constants/path/core';

@Injectable()
export class FileService implements OnApplicationBootstrap {
  constructor(private readonly logService: LogService) {}

  onApplicationBootstrap() {
    this.folderInit(TORRENT_FILE_PATH);
    this.fileInit(`${STORE_PATH}/store.json`);
  }

  private folderInit(folderPath: string) {
    if (!fs.existsSync(path.join(process.cwd(), folderPath))) {
      fs.mkdirSync(path.join(process.cwd(), folderPath), {
        recursive: true,
      });
      this.logService.log(`[OK] 目录已创建: ${folderPath}`);
    } else {
      this.logService.log(`[INFO] 目录已存在: ${folderPath}`);
    }
  }

  private fileInit(filePath: string) {
    if (!fs.existsSync(path.join(process.cwd(), filePath))) {
      fs.writeFileSync(
        path.join(process.cwd(), filePath),
        JSON.stringify([], null, 2),
        'utf8',
      );

      this.logService.log(`[OK] 文件已创建: ${filePath}`);
    } else {
      this.logService.log(`[INFO] 文件已存在: ${filePath}`);
    }
  }

  getStoreJson(storePath: string) {
    const rawData = fs.readFileSync(
      path.join(process.cwd(), storePath),
      'utf8',
    );

    return JSON.parse(rawData);
  }
}
