import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { Post, PostDocument } from '../../Schemas/post.schema';
import { PostViewModelWithQuery } from '../../DTO/Post/post-view-model';
import { Blog, BlogDocument } from '../../Schemas/blog.schema';
import { BlogViewModelWithQuery } from '../../DTO/Blog/blog-view-model';
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";
import { Like, LikeDocument } from "../../Schemas/like.schema";

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    public helpers: Helpers,
  ) {}
  async getBlogs(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<BlogViewModelWithQuery> {
    const matchedBlogsWithSkip = await this.blogModel
      .find({
        name: searchNameTerm
          ? { $regex: searchNameTerm, $options: 'i' }
          : { $regex: '.' },
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();

    const matchedBlogs = await this.blogModel
      .find({
        name: searchNameTerm
          ? { $regex: searchNameTerm, $options: 'i' }
          : { $regex: '.' },
      })
      .sort({ sortBy: sortDirection })
      .exec();
    const pagesCount = Math.ceil(matchedBlogs.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedBlogs.length,
      items: matchedBlogsWithSkip.map(this.helpers.blogMapperToView),
    };
  }

  async getPostsRelatedToBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    blogId: string,
    userId
  ): Promise<PostViewModelWithQuery> {
    const matchedPosts = await this.postModel.find({blogId:blogId}).skip((pageNumber - 1) * pageSize).limit(Number(pageSize)).sort([[sortBy, sortDirection]]).exec()
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
