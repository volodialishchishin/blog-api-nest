import { Types } from 'mongoose';

export type BlogViewModel = {
  id: string;
  name: string;
  websiteUrl: string;
  createdAt: string;
  description: string;
  isMembership: boolean;
  blogOwnerInfo?: {
    userId: string;
    userLogin: string;
  };
};

export type BlogViewModelSA = {
  id: string;
  name: string;
  websiteUrl: string;
  createdAt: string;
  description: string;
  isMembership: boolean;
  blogOwnerInfo?: {
    userId: string;
    userLogin: string;
  };
  banInfo: {
    isBanned: boolean;
    banDate: string;
  };
};
export type BlogViewModelWithQuery = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogViewModel>;
};
