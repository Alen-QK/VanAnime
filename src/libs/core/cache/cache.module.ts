import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 600,
      max: 100,
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
