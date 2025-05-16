import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Injectable } from '@nestjs/common';
import { LogService } from '../log/log.service';
import { Ctx } from '../../modal/ctx/Ctx';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  enableLogs?: boolean;
}

@Injectable()
export class ApiClientService {
  private axiosInstance: AxiosInstance;
  private readonly ctx: Ctx = {
    serviceContext: 'ApiClientService',
  };

  constructor(
    private readonly logService: LogService,
    private readonly options: CustomAxiosRequestConfig,
  ) {
    const { enableLogs, ...config } = options;
    this.axiosInstance = axios.create(config);

    if (enableLogs) {
      this.axiosInstance.interceptors.request.use(this.handleRequest);
      this.axiosInstance.interceptors.response.use(
        this.handleResponse,
        this.handleErrorResponse,
      );
    }
  }

  getLogger() {
    return this.logService;
  }

  private handleRequest = (
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig => {
    const ctx: Ctx = { ...this.ctx, functionContext: 'handleRequest' };
    this.logService.log(
      `<-- ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      ctx,
    );
    return config;
  };

  private handleResponse = (response: AxiosResponse): AxiosResponse => {
    const ctx: Ctx = { ...this.ctx, functionContext: 'handleResponse' };
    this.logService.log(
      `${response.status} --> ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url}，RESPONSE <==> ${JSON.stringify(response.data, null, 2)}`,
      ctx,
    );
    return response;
  };

  //客制化错误响应，但仍需回报错误 https://axios-http.com/docs/interceptors
  private handleErrorResponse = (error: AxiosError): Promise<AxiosError> => {
    const ctx: Ctx = { ...this.ctx, functionContext: 'handleErrorResponse' };
    this.logService.error(`HTTP响应错误！${error.message}`, ctx);
    return Promise.reject(error);
  };

  setGlobalHeader(headerKey: string, headerValue: string): void {
    this.axiosInstance.defaults.headers.common[headerKey] = headerValue;
  }

  removeGlobalHeader(headerKey: string): void {
    delete this.axiosInstance.defaults.headers.common[headerKey];
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(
      url,
      config,
    );
    return response;
  }

  async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(
      url,
      data,
      config,
    );
    return response;
  }

  async put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(
      url,
      data,
      config,
    );
    return response;
  }

  async patch<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(
      url,
      data,
      config,
    );
    return response;
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(
      url,
      config,
    );
    return response;
  }
}
