import { DMHYSearchContent } from '../../../libs/modal/query/query.body';
import { ApiProperty } from '@nestjs/swagger';

export class SearchParamDTO {
  @ApiProperty()
  source: string;

  @ApiProperty({
    type: Object,
    example: {
      search: 'string',
      type: 'string',
      fansubName: 'string | string[]',
      include: 'string | string[]',
      exclude: 'string[]',
      keywords: 'string[]',
    },
  })
  searchContent: DMHYSearchContent;
}
