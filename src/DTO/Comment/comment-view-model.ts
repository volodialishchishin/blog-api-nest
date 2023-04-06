import { LikeInfoViewModel } from '../LikeInfo/like-info-view-model';
import { Types } from 'mongoose';

export type CommentViewModel = {
  id: Types.ObjectId;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  content: string;
  createdAt: string;
  likesInfo: LikeInfoViewModel;
};
export type CommentViewModelWithQuery = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewModel>;
};
