import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogService } from '../../core/log/log.service';
import { QBLoginFailedException } from '../../exceptions/qb/QBLoginFailedException';
import { QBaddTaskFailedException } from '../../exceptions/qb/QBaddTaskFailedException';
import { QBtaskInfoException } from '../../exceptions/qb/QBtaskInfoException';
import {
  MagnetFile,
  MagnetFileDetails,
  QBTaskContent,
} from '../../modal/magnet/file';
import * as path from 'path';
import * as fs from 'fs';
import FormData from 'form-data';
import * as process from 'node:process';
import { QBresumeTaskException } from '../../exceptions/qb/QBresumeTaskException';
import { QB_V5_ENDPOINTS, QB_V5_STATES } from '../../constants/qbittorrent/v5';
import { QB_V4_ENDPOINTS, QB_V4_STATES } from '../../constants/qbittorrent/v4';
import { TORRENT_FILE_PATH } from '../../constants/path/core';
import { ApiClientService } from 'src/libs/core/apiClient/apiClient.service';
import { Ctx } from 'src/libs/modal/ctx/Ctx';

@Injectable()
export class QbittorrentService implements OnModuleInit {
  private qbHost: string | undefined = undefined;
  private username: string | undefined = undefined;
  private password: string | undefined = undefined;
  private qbVersion: string | undefined = undefined;
  private QB_ENDPOINTS: typeof QB_V5_ENDPOINTS | typeof QB_V4_ENDPOINTS;
  private QB_STATES: typeof QB_V5_STATES | typeof QB_V4_STATES;
  private readonly ctx: Ctx = {
    serviceContext: 'QbittorrentService',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logService: LogService,
    @Inject('QbittorrentService')
    private readonly apiService: ApiClientService,
  ) {
    this.qbHost = this.configService.get<string>('QB_HOST');
    this.username = this.configService.get<string>('QB_USERNAME');
    this.password = this.configService.get<string>('QB_PASSWORD');
    this.qbVersion = this.configService.get<string>('QB_VERSION') || 'v5';
  }

  async onModuleInit() {
    await this.QBlogin();
    this.initQBConstants();
  }

  async QBlogin() {
    const ctx: Ctx = { ...this.ctx, functionContext: 'QBlogin' };
    try {
      const response = await this.apiService.post(
        '/api/v2/auth/login',
        {
          username: this.username,
          password: this.password,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Referer: this.qbHost,
            Origin: this.qbHost,
          },
        },
      );

      if (response.headers['set-cookie']) {
        this.apiService.setGlobalHeader(
          'Cookie',
          response.headers['set-cookie'][0],
        );
        this.logService.log('qBittorrent 登录成功', ctx);
      } else {
        this.logService.error('qBittorrent 登录失败，未返回 Cookie', ctx);
      }
    } catch (error) {
      this.logService.error(
        'qBittorrent 连接失败, 请检查QB配置重启重试',
        ctx,
        (error as Error).stack,
      );
      throw new QBLoginFailedException((error as Error).message);
    }
  }

  async addMagnet(magnet: string) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'addMagnet' };
    try {
      const response = await this.apiService.post(
        '/api/v2/torrents/add',
        { urls: magnet },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        this.logService.log('已提交磁力链接', ctx);
      } else {
        this.logService.error('磁力链接提交失败，格式可能有误', ctx);
        throw new QBaddTaskFailedException(
          'QB提交API没有返回200, 磁力链接格式可能不正确',
        );
      }
    } catch (error) {
      this.logService.error('QB提交API出错，提交失败', ctx);
      throw new QBaddTaskFailedException((error as Error).message);
    }
  }

  async submitNewTask(fileDetails: MagnetFileDetails) {
    const { filesList, torrentName, infoHash } = fileDetails;
    const addResult = await this.addTorrent(torrentName).then();
    // todo 考虑到实际服务器性能和意外情况，建议从硬等待改为短轮询
    await this.delay(3000);

    if (addResult) {
      const torrentContents = await this.getTorrentContents(infoHash);

      if (torrentContents) {
        const changePrioResult = await this.changeContentPriority(
          infoHash,
          filesList,
          torrentContents,
        );

        if (changePrioResult) {
          const resumeResult = await this.resumeQBTask(infoHash);

          if (resumeResult) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // metaDL, stoppedDL, downloading,

  private async getTaskState(hash: string) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'getTaskState' };
    try {
      const response = await this.apiService.get('/api/v2/torrents/info', {
        params: {
          hashes: hash,
        },
      });

      if (response.status === 200) {
        console.log(response.data);
      }
    } catch (error) {
      this.logService.error('获取QB任务失败', ctx);
      throw new QBtaskInfoException((error as Error).message);
    }
  }

  private async addTorrent(torrentName: string) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'addTorrent' };
    const torrentPath = path.join(
      process.cwd(),
      `${TORRENT_FILE_PATH}/${torrentName}.torrent`,
    );
    const form = new FormData();

    form.append('torrents', fs.createReadStream(torrentPath));
    form.append(this.qbVersion === 'v5' ? 'stopped' : 'paused', 'true');

    try {
      const response = await this.apiService.post(
        '/api/v2/torrents/add',
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        },
      );

      if (response.status === 200) {
        return true;
      } else {
        this.logService.error('QB提交API出错，提交失败', ctx);
        return false;
      }
    } catch (error) {
      this.logService.error(
        '服务器内部错误，QB提交API失败',
        ctx,
        (error as Error).stack,
      );
      throw new QBaddTaskFailedException((error as Error).message);
    }
  }

  private async getTorrentContents(hash: string) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'getTorrentContents' };
    try {
      const response = await this.apiService.get('/api/v2/torrents/files', {
        params: {
          hash,
        },
      });

      if (response.status === 200) {
        return response.data as QBTaskContent[];
      }
    } catch (error) {
      this.logService.error(
        'QB获取文件列表API出错，获取失败',
        ctx,
        (error as Error).stack,
      );
      throw new QBaddTaskFailedException((error as Error).message);
    }
  }

  private async changeContentPriority(
    hash: string,
    filesList: MagnetFile[],
    torrentContents: QBTaskContent[],
  ) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'changeContentPriority' };
    const selectedFiles = new Set(filesList.map((file) => file.name));
    const unselected = torrentContents.filter(
      (content: { name: string }) =>
        !selectedFiles.has(content.name.split('/')[1]),
    );

    let id = '';

    for (const file of unselected) {
      if (id === '') id += file.index;
      else id = id + '|' + file.index;
    }

    try {
      const response = await this.apiService.post(
        `/api/v2/torrents/filePrio`,
        {
          hash,
          id,
          priority: 0,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        return true;
      } else {
        this.logService.error(
          `QB修改文件优先级失败，错误: ${response.status}`,
          ctx,
        );
        return false;
      }
    } catch (error) {
      this.logService.error('QB修改文件优先级API出错，提交失败', ctx);
      throw new QBaddTaskFailedException((error as Error).message);
    }
  }

  private async resumeQBTask(hash: string) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'resumeQBTask' };
    try {
      const response = await this.apiService.post(
        `/api/v2/torrents/${this.QB_ENDPOINTS.start}`,
        { hashes: hash },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      this.logService.error(
        `QB恢复任务下载失败，错误信息: ${(error as Error).message}`,
        ctx,
      );
      throw new QBresumeTaskException((error as Error).message);
    }
  }

  private delay(ms: number) {
    const ctx: Ctx = { ...this.ctx, functionContext: 'resumeQBTask' };
    return new Promise((resolve) => {
      this.logService.log('等待QB生成任务.......', ctx);
      setTimeout(resolve, ms);
    });
  }

  private initQBConstants() {
    if (this.qbVersion === 'v5') {
      this.QB_ENDPOINTS = QB_V5_ENDPOINTS;
      this.QB_STATES = QB_V5_STATES;
    } else {
      this.QB_ENDPOINTS = QB_V4_ENDPOINTS;
      this.QB_STATES = QB_V4_STATES;
    }
  }
}
