import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Helpers } from '../Helpers/helpers';
import { Comment, CommentDocument } from '../../DB/Schemas/comment.schema';
import {
  allCommentsForUserViewModel,
  allCommentsForUserViewModelWithQuery,
  CommentViewModelWithQuery,
} from '../../DTO/Comment/comment-view-model';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';
import { Post, PostDocument } from '../../DB/Schemas/post.schema';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
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
  ) {
    const matchedComments = await this.commentModel
      .find({ postId: postId })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();
    const allComments = await this.commentModel.find({ postId: postId }).exec();
    const pagesCount = Math.ceil(allComments.length / pageSize);
    const matchedCommentsWithLikes = await Promise.all(
      matchedComments.map(async (comment) => {
        if (comment.isUserBanned) return;
        const mappedComment = await this.helpers.commentsMapperToView(comment);
        if (!userId) {
          return mappedComment;
        }

        const myLikeForComment = await this.likeModel.findOne({
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
      items: matchedCommentsWithLikes.filter(Boolean),
    };
  }

  async getAllCommentsForBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<allCommentsForUserViewModelWithQuery> {
    const comments = await this.commentModel
      .find({ blogOwnerId: userId })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();
    const allComments = await this.commentModel
      .find({ blogOwnerId: userId })
      .exec();
    const pagesCount = Math.ceil(allComments.length / pageSize);
    const mappedComments: Array<allCommentsForUserViewModel> =
      await Promise.all(
        comments.map(async (comment) => {
          console.log(comment.postId);
          const relatedPost = await this.postModel
            .findOne({ _id: comment.postId })
            .exec();
          console.log(relatedPost);
          const myLikeForComment = await this.likeModel
            .findOne({
              userId,
              entityId: comment.id,
            })
            .exec();
          const likesCount = await this.likeModel
            .find({
              entityId: comment.id,
              status: LikeInfoViewModelValues.like,
              isUserBanned: false,
            })
            .exec();
          const disLikesCount = await this.likeModel
            .find({
              entityId: comment.id,
              status: LikeInfoViewModelValues.dislike,
              isUserBanned: false,
            })
            .exec();
          return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
              userId: comment.userId,
              userLogin: comment.userLogin,
            },
            createdAt: comment.createdAt,
            likesInfo: {
              likesCount: likesCount.length,
              dislikesCount: disLikesCount.length,
              myStatus: myLikeForComment?.status || 'None',
            },
            postInfo: {
              id: relatedPost._id.toString(),
              title: relatedPost.title,
              blogId: relatedPost.blogId,
              blogName: relatedPost.blogName,
            },
          };
        }),
      );
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: allComments.length,
      items: mappedComments.filter(Boolean),
    };
  }
}
