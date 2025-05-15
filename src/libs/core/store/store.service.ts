import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LogService } from '../log/log.service';
import { StoreTaskRecord } from '../../modal/store/StoreTaskRecord';
import { FileService } from '../file/file.service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { STORE_PATH } from '../../constants/path/core';
import { MagnetFile } from '../../modal/magnet/file';
import { Ctx } from 'src/libs/modal/ctx/Ctx';

@Injectable()
export class StoreService implements OnApplicationBootstrap {
  private readonly storeJsonPath: string;
  private taskStore: StoreTaskRecord[];
  private readonly ctx: Ctx = {
    serviceContext: 'StoreService',
  };

  constructor(
    private readonly logService: LogService,
    private readonly fileService: FileService,
  ) {
    this.storeJsonPath = `${STORE_PATH}/store.json`;
  }

  addNewRecord(
    name: string,
    magnet: string,
    infoHash: string,
    source: string,
    selectedContents: MagnetFile[],
  ) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'addNewRecord' };
    const newTaskRecord: StoreTaskRecord = {
      name,
      magnet,
      infoHash,
      source,
      isCompleted: false,
      isDownloaded: false,
      addDate: Date.now(),
      selectedContents,
    };

    this.taskStore.push(newTaskRecord);
    fs.writeFile(
      path.join(process.cwd(), this.storeJsonPath),
      JSON.stringify(this.taskStore, null, 2),
      { encoding: 'utf8' },
      (error) => {
        if (error) {
          this.logService.error('更新store.json失败', ctx, error.stack);
          throw error as Error;
        }

        this.logService.log('已更新store.json', ctx);
      },
    );
  }

  getTaskStore() {
    return this.taskStore;
  }

  findTask(infoHash?: string) {
    if (infoHash) {
      return this.taskStore.find((record) => record.infoHash === infoHash);
    }

    // if (name) {
    //   return this.taskStore.find((record) => record.infoHash === name);
    // }
  }

  onApplicationBootstrap() {
    const ctx: Ctx = { ...this.ctx, functionContext: 'onApplicationBootstrap' };
    try {
      const store = this.fileService.getStoreJson(
        this.storeJsonPath,
      ) as StoreTaskRecord[];
      this.taskStore = store;
    } catch (error) {
      this.logService.error(
        `解析本地store文件失败，请检查store.json对应路径`,
        ctx,
      );
      throw error as Error;
    }
  }
}
