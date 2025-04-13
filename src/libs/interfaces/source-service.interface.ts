import { SearchResult } from '../modal/query/query.search-result';

export interface SourceServiceInterface<T> {
  search(queryParam: T): Promise<SearchResult[]>;
}
