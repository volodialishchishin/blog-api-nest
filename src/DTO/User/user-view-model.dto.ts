import { Types } from 'mongoose';

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};
export type UserViewModelWithQuery = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewModel>;
};
