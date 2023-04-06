import { Types } from 'mongoose';

export type BlogViewModel = {
  id: Types.ObjectId;
  name: string;
  websiteUrl: string;
  createdAt: string;
  description: string;
  isMembership:boolean;
};
export type BlogViewModelWithQuery = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogViewModel>;
};
