import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { PostDocument } from '../../DB/Schemas/post.schema';
import { PostViewModel } from '../../DTO/Post/post-view-model';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { CommentDocument } from '../../DB/Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';
import { BlogDocument } from '../../DB/Schemas/blog.schema';
import { BlogViewModel, BlogViewModelSA } from '../../DTO/Blog/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { Injectable } from '@nestjs/common';
import { Token, TokenDocument } from '../../DB/Schemas/token.schema';
import { UserEntity } from '../../DB/Entities/user.entity';
import { SessionEntity } from '../../DB/Entities/session.entity';
import { BlogEntity } from '../../DB/Entities/blog.entity';
import { PostEntity } from '../../DB/Entities/post.entity';
import { CommentEntity } from "../../DB/Entities/comment.entity";

Injectable();
export class Helpers {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}
  public userMapperToView(user: UserDocument): UserViewModel {
    return {
      id: user._id.toString(),
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      login: user.accountData.login,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banReason: user.banInfo.banReason,
        banDate: user.banInfo.banDate,
      },
    };
  }

  public userMapperToViewSql(user: UserEntity): UserViewModel {
    return {
      id: user.id.toString(),
      email: user.email,
      createdAt: user.createdAt,
      login: user.login,
      banInfo: {
        isBanned: user.isBanned,
        banReason: user.banReason,
        banDate: user.banDate,
      },
    };
  }

  public userMapperToDocument(user: UserEntity) {
    return {
      id: user.id,
      accountData: {
        login: user.login,
        email: user.email,
        password: user.password,
        passwordSalt: user.passwordSalt,
        createdAt: user.createdAt,
      },
      emailConfirmation: {
        isConfirmed: user.isEmailConfirmed,
        confirmationCode: user.emailConfirmationCode,
        confirmationDate: new Date(user.emailConfirmationDate),
      },
      banInfo: {
        isBanned: user.isBanned,
        banReason: user.banReason,
        banDate: user.banDate,
      },
    };
  }

  public async postMapperToView(post: PostDocument): Promise<PostViewModel> {
    const likesCount = await this.likeModel
      .find({
        entityId: post.id,
        status: LikeInfoViewModelValues.like,
        isUserBanned: false,
      })
      .exec();
    const disLikesCount = await this.likeModel
      .find({
        entityId: post.id,
        status: LikeInfoViewModelValues.dislike,
        isUserBanned: false,
      })
      .exec();
    return {
      id: post._id.toString(),
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

  public postMapperToViewSql(
    post: PostEntity & {
      blogName: string;
      dateAdded: string;
      userLogin: string;
      userId: string;
      likesCount: number;
      dislikesCount: number;
    },
  ): PostViewModel {
    console.log(post.blogName, post);
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount||0,
        dislikesCount: post.dislikesCount || 0,
        myStatus: LikeInfoViewModelValues.none,
        newestLikes: [],
      },
    };
  }

  public async commentsMapperToView(
    comment: CommentDocument,
  ): Promise<CommentViewModel> {
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
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      id: comment._id.toString(),
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likesCount.length,
        dislikesCount: disLikesCount.length,
        myStatus: LikeInfoViewModelValues.none,
      },
    };
  }

  public async commentsMapperToViewSql(
    comment: CommentEntity & {login:string, likesCount:number, disLikesCount:number},
  ): Promise<CommentViewModel> {
    console.log('mapper',comment);
    return {
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.login,
      },
      id: comment.id.toString(),
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount || 0,
        dislikesCount: comment.disLikesCount || 0,
        myStatus: LikeInfoViewModelValues.none,
      },
    };
  }

  public blogMapperToView(blog: BlogDocument): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
    };
  }

  public blogMapperToViewSql(blog: BlogEntity): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
    };
  }
  public blogMapperToViewSa(blog: BlogDocument): BlogViewModelSA {
    return {
      id: blog._id.toString(),
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId,
        userLogin: blog.userLogin,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
      },
    };
  }

  public blogMapperToViewSaSql(
    blog: BlogEntity & { login: string },
  ): BlogViewModelSA {
    return {
      id: blog.id.toString(),
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId,
        userLogin: blog.login,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
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

  deviceMapperToViewSql(token: SessionEntity) {
    return {
      deviceId: token.deviceId,
      lastActiveDate: token.lastActiveDate,
      ip: token.ip,
      title: token.title,
    };
  }
}
