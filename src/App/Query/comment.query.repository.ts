import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Helpers } from '../Helpers/helpers';
import { Comment, CommentDocument } from '../../Schemas/comment.schema';
import { CommentViewModelWithQuery } from '../../DTO/Comment/comment-view-model';
import { Like, LikeDocument } from '../../Schemas/like.schema';
import { User, UserDocument } from '../../Schemas/user.schema';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    public helpers: Helpers,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async getComments(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    postId: string,
    userId: string,
  ): Promise<CommentViewModelWithQuery> {
    let matchedComments = await this.commentModel
      .find({ postId: postId })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();
    const allComments = await this.commentModel.find({ postId: postId }).exec();
    const pagesCount = Math.ceil(allComments.length / pageSize);
    const matchedCommentsWithLikes = await Promise.all(
      matchedComments.map(async (comment) => {
        if (comment.isUserBanned) return null;
        const mappedComment = await this.helpers.commentsMapperToView(comment);
        if (!userId) {
          return mappedComment;
        }

        let myLikeForComment = await this.likeModel.findOne({
          userId,
          entityId: comment.id,
        });

        if (myLikeForComment) {
          mappedComment.likesInfo.myStatus = myLikeForComment.status;
          return mappedComment;
        }
        return mappedComment;
      }),
    );

    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: allComments.length,
      items: matchedCommentsWithLikes,
    };
  }
}
