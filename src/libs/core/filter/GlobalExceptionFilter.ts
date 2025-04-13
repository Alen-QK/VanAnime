import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LogService } from '../log/log.service';
import { Response, Request } from 'express';
import { ExceptionResponseInterface } from '../../interfaces/exception-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new LogService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as ExceptionResponseInterface).message;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else if (typeof exception === 'string') {
      message = exception;
    } else if (typeof exception === 'object') {
      message = JSON.stringify(exception);
    }

    this.logger.error(
      `🚨 Error: ${message}, Status: ${status}, URL: ${request.url}, Method: ${request.method}`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      error: message,
    });
  }
}
