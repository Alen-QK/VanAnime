import {
  ApiServiceService,
  CustomAxiosRequestConfig,
} from './apiService.service';
import { LogService } from '../core/log/log.service';
import { DynamicModule, Module, Provider } from '@nestjs/common';

@Module({})
export class ApiServiceModule {
  public static forRoot(config: CustomAxiosRequestConfig): DynamicModule {
    return {
      module: ApiServiceModule,
      providers: [
        {
          provide: ApiServiceService,
          inject: [LogService],
          useFactory: (logService: LogService) => {
            return new ApiServiceService(logService, config);
          },
        },
      ],
      exports: [ApiServiceService],
    };
  }

  // May need to refactor, 将forSingleFeature合并到forFeature中以符合nestjs设计规范
  static forSingleFeature(option: {
    serviceName: string;
    config: CustomAxiosRequestConfig;
  }) {
    const providerName = option.serviceName;
    return {
      module: ApiServiceModule,
      providers: [
        {
          provide: providerName,
          inject: [LogService],
          useFactory: (logService: LogService) => {
            return new ApiServiceService(logService, option.config);
          },
        },
      ],
      exports: [providerName],
    };
  }

  static forFeature(
    options: { serviceName: string; config: CustomAxiosRequestConfig }[],
  ): DynamicModule {
    return options.reduce(
      (results: DynamicModule, option) => {
        const providerName = option.serviceName;
        results.providers?.push({
          provide: providerName,
          inject: [LogService],
          useFactory: (logService: LogService) => {
            return new ApiServiceService(logService, option.config);
          },
        });
        results.exports?.push(providerName);
        return results;
      },
      {
        module: ApiServiceModule,
        providers: [],
        exports: [],
      },
    );
  }

  static forFeatureWithProvider(options: {
    serviceName: string;
    config: CustomAxiosRequestConfig;
  }): {
    module: DynamicModule;
    provider: Provider;
  } {
    const providerName = options.serviceName;
    const provider = {
      provide: providerName,
      inject: [LogService],
      useFactory: (logService: LogService) => {
        return new ApiServiceService(logService, options.config);
      },
    } as Provider;
    return {
      module: {
        module: ApiServiceModule,
        providers: [provider],
        exports: [providerName, ApiServiceModule],
      },
      provider,
    };
  }
}
