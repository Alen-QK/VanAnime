import axios, { AxiosResponse } from 'axios';
import { BangumiCalenderAPIResponse } from '../../modal/query/bangumi-calender';

export async function fetchCalenderAPI(): Promise<string[]> {
  const response: AxiosResponse<BangumiCalenderAPIResponse> = await axios.get(
    'https://api.bgm.tv/calendar',
  );
  const calender: BangumiCalenderAPIResponse = response.data;

  return calender.flatMap((group) =>
    group.items.map((bangumi) => bangumi.name_cn),
  );
}
