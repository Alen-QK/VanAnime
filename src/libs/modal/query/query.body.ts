export type QueryBodyType = {
  source: string;
  searchContent: DMHYSearchContent;
};

export type DMHYSearchContent = {
  search?: string[];
  type?: string;
  fansubName?: string | string[];
  include?: string | string[];
  exclude?: string[];
  keywords?: string[];
};
