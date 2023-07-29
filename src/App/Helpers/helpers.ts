import { UserDocument } from '../../Schemas/user.schema';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { PostDocument } from '../../Schemas/post.schema';
import { PostViewModel } from '../../DTO/Post/post-view-model';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { CommentDocument } from '../../Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';
import { BlogDocument } from '../../Schemas/blog.schema';
import { BlogViewModel } from '../../DTO/Blog/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from '../../Schemas/like.schema';
import { Injectable } from '@nestjs/common';
import { Token, TokenDocument } from '../../Schemas/token.schema';

Injectable();
export class Helpers {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}
  public userMapperToView(user: UserDocument): UserViewModel {
    return {
      id: user._id,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      login: user.accountData.login,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banReason: user.banInfo.banReason,
        banDate: user.banInfo.banDate
      }
    };
  }

  public async postMapperToView(post: PostDocument): Promise<PostViewModel> {
    let likesCount = await this.likeModel
      .find({
        entityId: post.id,
        status: LikeInfoViewModelValues.like,
        isUserBanned: false,
      })
      .exec();
    let disLikesCount = await this.likeModel
      .find({
        entityId: post.id,
        status: LikeInfoViewModelValues.dislike,
        isUserBanned: false,
      })
      .exec();
    return {
      id: post._id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesCount.length,
        dislikesCount: disLikesCount.length,
        myStatus: LikeInfoViewModelValues.none,
        newestLikes: [],
      },
    };
  }

  public async commentsMapperToView(
    comment: CommentDocument,
  ): Promise<CommentViewModel> {
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
    return {
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      id: comment._id,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likesCount.length,
        dislikesCount: disLikesCount.length,
        myStatus: LikeInfoViewModelValues.none,
      },
    };
  }

  public blogMapperToView(blog: BlogDocument): BlogViewModel {
    return {
      id: blog._id,
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
    };
  }
  public blogMapperToViewSa(blog: BlogDocument): BlogViewModel {
    return {
      id: blog._id,
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId,
        userLogin: blog.userLogin,
      },
    };
  }

  deviceMapperToView(token: Token) {
    return {
      deviceId: token.deviceId,
      lastActiveDate: token.lastActiveDate,
      ip: token.ip,
      title: token.title,
    };
  }
}
