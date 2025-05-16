import {
  ApiClientService,
  CustomAxiosRequestConfig,
} from './apiClient.service';
import { LogService } from '../log/log.service';
import { DynamicModule, Module, Provider } from '@nestjs/common';

@Module({})
export class ApiClientModule {
  public static forRoot(config: CustomAxiosRequestConfig): DynamicModule {
    return {
      module: ApiClientModule,
      providers: [
        {
          provide: ApiClientService,
          inject: [LogService],
          useFactory: (logService: LogService) => {
            return new ApiClientService(logService, config);
          },
        },
      ],
      exports: [ApiClientService],
    };
  }

  // May need to refactor, 将forSingleFeature合并到forFeature中以符合nestjs设计规范
  static forSingleFeature(option: {
    serviceName: string;
    config: CustomAxiosRequestConfig;
  }) {
    const providerName = option.serviceName;
    return {
      module: ApiClientModule,
      providers: [
        {
          provide: providerName,
          inject: [LogService],
          useFactory: (logService: LogService) => {
            return new ApiClientService(logService, option.config);
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
            return new ApiClientService(logService, option.config);
          },
        });
        results.exports?.push(providerName);
        return results;
      },
      {
        module: ApiClientModule,
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
        return new ApiClientService(logService, options.config);
      },
    } as Provider;
    return {
      module: {
        module: ApiClientModule,
        providers: [provider],
        exports: [providerName, ApiClientModule],
      },
      provider,
    };
  }
}
