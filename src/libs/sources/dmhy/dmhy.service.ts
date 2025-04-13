import { Injectable } from '@nestjs/common';
import { SourceServiceInterface } from '../../interfaces/source-service.interface';
import { DMHYSearchContent } from '../../modal/query/query.body';
import { SearchResult } from '../../modal/query/query.search-result';
import { fetchResources } from 'animegarden';
import { LogService } from '../../core/log/log.service';
import { ConfigService } from '@nestjs/config';
import { DmhyAPIException } from '../../exceptions/query/DmhyAPIException';

@Injectable()
export class DmhyService implements SourceServiceInterface<DMHYSearchContent> {
  constructor(
    private readonly logService: LogService,
    private readonly configService: ConfigService,
  ) {}

  async search(query: DMHYSearchContent): Promise<SearchResult[]> {
    const fetchQuery = {
      ...query,
      provider: 'dmhy',
      page: this.configService.get<number>('DMHY_PAGE_NUM'),
      pageSize: this.configService.get<number>('DMHY_PAGE_SIZE'),
    };

    this.logService.log(fetchQuery);

    try {
      const response = await fetchResources(fetch, fetchQuery);
      const resources = response.resources;
      return resources.map((resource) => {
        return {
          provider: resource.provider,
          title: resource.title,
          href: resource.href,
          type: resource.type,
          magnet: resource.magnet,
          size: resource.size,
        };
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logService.error(error.message, error.stack);
        throw new DmhyAPIException();
      } else {
        throw new Error('Unexpect Anime Garden API error occurred.');
      }
    }
  }
}
