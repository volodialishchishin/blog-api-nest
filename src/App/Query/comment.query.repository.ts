import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Helpers } from '../Helpers/helpers';
import { Comment, CommentDocument } from '../../Schemas/comment.schema';
import {
  allCommentsForUserViewModel,
  allCommentsForUserViewModelWithQuery,
  CommentViewModelWithQuery
} from "../../DTO/Comment/comment-view-model";
import { Like, LikeDocument } from '../../Schemas/like.schema';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Blog, BlogDocument } from "../../Schemas/blog.schema";
import { PostDocument } from "../../Schemas/post.schema";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Comment.name) private postModel: Model<PostDocument>,
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
        if (comment.isUserBanned) return;
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
      items: matchedCommentsWithLikes.filter(Boolean),
    };
  }

  async getAllCommentsForBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId:string
  ):Promise<allCommentsForUserViewModelWithQuery>{
    let comments = await this.commentModel.find({blogOwnerId:userId}).skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();
    const allComments = await this.commentModel.find({blogOwnerId:userId}).exec();
    const pagesCount = Math.ceil(allComments.length / pageSize);
    let mappedComments: Array<allCommentsForUserViewModel> = await Promise.all(comments.map(async comment => {
      let relatedPost = await this.postModel.findOne({_id:comment.postId})
      let myLikeForComment = await this.likeModel.findOne({
        userId,
        entityId: comment.id,
      });
      let likesCount = await this.likeModel
        .find({
          entityId: comment.id,
          status: LikeInfoViewModelValues.like,
          isUserBanned: false,
        })
        .exec();
      let disLikesCount = await this.likeModel
        .find({
          entityId: comment.id,
          status: LikeInfoViewModelValues.dislike,
          isUserBanned: false,
        })
        .exec();
      return{
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo:{
          userId: comment.userId,
          userLogin: comment.userLogin
        },
        createdAt:comment.createdAt,
        likesInfo: {
          likesCount: likesCount.length,
          dislikesCount: disLikesCount.length,
          myStatus: myLikeForComment.status
        },
        postInfo: {
          id: relatedPost.id,
          title: relatedPost.title,
          blogId: relatedPost.blogId,
          blogName: relatedPost.blogName
        }
      }
    }))
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: allComments.length,
      items: mappedComments.filter(Boolean),
    };
  }
}
