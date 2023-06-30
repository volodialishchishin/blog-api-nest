import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Helpers } from '../Helpers/helpers';
import { Comment, CommentDocument } from '../Schemas/comment.schema';
import { CommentViewModelWithQuery } from '../DTO/Comment/comment-view-model';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    public helpers: Helpers,
  ) {}
  async getComments(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    postId: string,
  ): Promise<CommentViewModelWithQuery> {
    const matchedCommentsWithSkip = await this.commentModel
      .find({ postId: postId })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();
    const matchedComments = await this.commentModel
      .find({ postId: postId })
      .exec();
    const pagesCount = Math.ceil(matchedComments.length / pageSize);

    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedComments.length,
      items: matchedCommentsWithSkip.map(this.helpers.commentsMapperToView),
    };
  }
}
