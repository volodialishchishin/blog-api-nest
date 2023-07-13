import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { Post, PostDocument } from '../../Schemas/post.schema';
import { PostViewModelWithQuery } from '../../DTO/Post/post-view-model';
import { Like, LikeDocument } from "../../Schemas/like.schema";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    public helpers: Helpers,
  ) {}
  async getPosts(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId:string
  ): Promise<PostViewModelWithQuery> {
    const matchedPostsWithSkip = await this.postModel
      .find()
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();

    const matchedPosts = await this.postModel.find({}).skip((pageNumber - 1) * pageSize).limit(Number(pageSize)).sort([[sortBy, sortDirection]]).exec()
    const pagesCount = Math.ceil(matchedPosts.length / pageSize);
    const matchedPostsWithLikes = await Promise.all(matchedPosts.map(async post=>{
      const mappedPost = await this.helpers.postMapperToView(post)
      let lastLikes = await this.likeModel.find({entityId:post.id, status: LikeInfoViewModelValues.like}).sort({dateAdded:-1}).limit(3).exec()
      mappedPost.extendedLikesInfo.newestLikes = lastLikes.map(e => {
        return {
          addedAt: e.dateAdded,
          userId: e.userId,
          login: e.userLogin
        }
      })
      if (!userId){
        return mappedPost
      }

      let myLikeForComment = await this.likeModel.findOne({
        userId,
        entityId:post.id
      }).exec()
      if (myLikeForComment){
        mappedPost.extendedLikesInfo.myStatus = myLikeForComment.status
        return mappedPost
      }
      return mappedPost
    }))
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedPosts.length,
      items: matchedPostsWithLikes
    };
  }
}
