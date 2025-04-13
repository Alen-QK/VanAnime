import { MagnetFileDetails } from '../../../../libs/modal/magnet/file';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MagnetSubmitDto {
  @ApiProperty({
    type: Object,
    example: {
      details: {
        filesList: [
          {
            name: 'string',
            length: 'number',
          },
        ],
        torrentName: 'string',
        infoHash: 'string',
      },
      originMagnet: 'string',
      source: 'string',
    },
  })
  @IsNotEmpty()
  details: MagnetFileDetails;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originMagnet: string;

  @ApiProperty()
  @IsNotEmpty()
  source: string;
}
