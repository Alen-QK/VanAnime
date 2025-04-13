import { Body, Controller, Post, Res } from '@nestjs/common';
import { QueryService } from './query.service';
import { Response } from 'express';
import { SearchParamDTO } from './dto/query.search.dto';
import { QueryBangumiCheckDto } from './dto/query.bangumi-check.dto';
import { HttpStatusCode } from 'axios';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  async queryFromSource(
    @Body() data: SearchParamDTO,
    @Res() res: Response,
  ): Promise<void> {
    const { source, searchContent } = data;
    if (!(await this.queryService.bangumiCheck(searchContent))) {
      const results = new QueryBangumiCheckDto(
        HttpStatusCode.Ok,
        false,
        '搜索目标为本季新番，不支持该搜索。',
      );
      res.status(200).json(results);
      return;
    }
    const results = await this.queryService.search(source, searchContent);

    res.status(200).json(results);
  }
}
