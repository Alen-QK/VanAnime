import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LogService } from '../log/log.service';
import { Ctx } from '../../modal/ctx/Ctx';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly ctx: Ctx = {
    serviceContext: 'PrismaService',
  };

  constructor(private readonly logService: LogService) {
    super();
  }

  async onModuleInit() {
    const ctx = { ...this.ctx, functionContext: 'SQLiteConnection' };
    try {
      await this.$connect();
      this.logService.log('已成功连接SQLite数据库', ctx);
    } catch (error) {
      this.logService.error('数据库连接失败', ctx);
      throw new Error((error as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
