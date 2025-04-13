export type BangumiCalenderAPIResponse = WeekDay[];

type WeekDay = {
  items: BangumiDetails[];
};

type BangumiDetails = {
  name: string;
  name_cn: string;
};
