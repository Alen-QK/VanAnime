import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Injectable } from '@nestjs/common';
import { LogService } from '../core/log/log.service';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  enableLogs?: boolean;
}

@Injectable()
export class ApiServiceService {
  private axiosInstance: AxiosInstance;

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

  private handleRequest = (
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig => {
    this.logService.log(
      `HTTP请求如下: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  };

  private handleResponse = (response: AxiosResponse): AxiosResponse => {
    this.logService.log(
      `HTTP请求响应${response.status}，具体如下: ${response.config.method?.toUpperCase()} ${response.config.baseURL}${
        response.config.url
      }`,
    );
    return response;
  };

  //客制化错误响应，但仍需回报错误 https://axios-http.com/docs/interceptors
  private handleErrorResponse = (error: AxiosError): Promise<AxiosError> => {
    this.logService.error(`HTTP响应错误！${error.message}`);
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
