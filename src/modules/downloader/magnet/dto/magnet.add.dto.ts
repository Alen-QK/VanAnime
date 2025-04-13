import { ApiProperty } from '@nestjs/swagger';

export class AddParamDTO {
  @ApiProperty()
  magnet: string;
}
