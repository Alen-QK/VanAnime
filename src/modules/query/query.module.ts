import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { SourcesModule } from '../../libs/sources/sources.module';
import { GlobalCacheModule } from '../../libs/core/cache/cache.module';

@Module({
  imports: [SourcesModule, GlobalCacheModule],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule {}
