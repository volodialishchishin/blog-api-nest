import { Types } from 'mongoose';

export type UserViewModel = {
  id: Types.ObjectId;
  login: string;
  email: string;
  createdAt: string;
};
export type UserViewModelWithQuery = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewModel>;
};
