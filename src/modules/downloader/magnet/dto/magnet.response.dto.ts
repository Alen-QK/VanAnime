import { ResponseBase } from '../../../../libs/dto/response-base.dto';
import { MagnetFileDetails } from '../../../../libs/modal/magnet/file';
import { ApiProperty } from '@nestjs/swagger';

export class MagnetParseResponseDto extends ResponseBase {
  constructor(
    statusCode: number,
    success: boolean,
    fileDetails: MagnetFileDetails,
  ) {
    super(statusCode, success);
    this.fileDetails = fileDetails;
  }

  @ApiProperty({
    description: '解析后的文件结构，包含hash，文件结构，以及文件名称',
  })
  readonly fileDetails: MagnetFileDetails;
}
