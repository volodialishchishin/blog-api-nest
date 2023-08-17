import { LikeInfoViewModel } from '../LikeInfo/like-info-view-model';
import { Types } from 'mongoose';

export type CommentViewModel = {
  id: string;
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
export type allCommentsForUserViewModel = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
};

export type allCommentsForUserViewModelWithQuery = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<allCommentsForUserViewModel>;
};
