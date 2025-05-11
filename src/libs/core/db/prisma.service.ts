import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LogService } from '../log/log.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logService: LogService) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logService.log('已连接数据库');
    } catch (error) {
      throw new Error(`数据库连接失败，Error：: ${error}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
