import { Inject, Injectable } from '@nestjs/common';
import { SourcesService } from '../../libs/sources/sources.service';
import { DMHYSearchContent } from '../../libs/modal/query/query.body';
import { QueryResponseDto } from './dto/query.response.dto';
import { HttpStatusCode } from 'axios';
import { fetchCalenderAPI } from '../../libs/utils/bangumi-api/fetchCalender';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import Fuse from 'fuse.js';
import { CalenderGetException } from '../../libs/exceptions/query/CalenderGetException';

@Injectable()
export class QueryService {
  constructor(
    private readonly sourcesService: SourcesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async search(
    source: string,
    searchContent: DMHYSearchContent,
  ): Promise<QueryResponseDto> {
    const searchService = this.sourcesService.getService(source);

    const res = await searchService?.search(searchContent);
    const response = new QueryResponseDto(HttpStatusCode.Ok, true, res, source);

    return response;
  }

  async bangumiCheck(searchContent: DMHYSearchContent): Promise<boolean> {
    const bangumiListKey = 'bangumiList';
    let cacheList = await this.cacheManager.get(bangumiListKey);

    if (!cacheList) {
      cacheList = await fetchCalenderAPI();
      await this.cacheManager.set(bangumiListKey, cacheList, 600 * 60 * 1000);
    }

    if (
      Array.isArray(cacheList) &&
      cacheList.every((item) => typeof item === 'string')
    ) {
      const fuseList = new Fuse(cacheList, { threshold: 0.4 });
      const checkResult = this.fuzzySearch(fuseList, searchContent);

      return checkResult;
    } else {
      throw new CalenderGetException();
    }
  }

  private fuzzySearch(
    fuseList: Fuse<string>,
    searchContent: DMHYSearchContent,
  ): boolean {
    const { search, include, keywords } = searchContent;

    if (Array.isArray(search) && search.length >= 1) {
      for (const key of search) {
        if (fuseList.search(key).length !== 0) return false;
      }
    }

    if (Array.isArray(include) && include.length >= 1) {
      for (const key of include) {
        if (fuseList.search(key).length !== 0) return false;
      }
    } else if (typeof include === 'string') {
      if (fuseList.search(include).length !== 0) return false;
    }

    if (Array.isArray(keywords) && keywords.length >= 1) {
      for (const key of keywords) {
        if (fuseList.search(key).length !== 0) return false;
      }
    }

    return true;
  }
}
