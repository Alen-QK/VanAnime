import { ApiProperty } from '@nestjs/swagger';
import { HttpStatusCode } from 'axios';

export class ResponseBase {
  constructor(statusCode: HttpStatusCode, success: boolean, message?: string) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
  }

  @ApiProperty({ description: 'Response status code' })
  readonly statusCode: HttpStatusCode;

  @ApiProperty({ description: 'Response status' })
  readonly success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string | undefined;
}
