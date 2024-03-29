import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { Post, PostDocument } from '../../DB/Schemas/post.schema';
import { PostViewModelWithQuery } from '../../DTO/Post/post-view-model';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    public helpers: Helpers,
  ) {}
  async getPosts(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<PostViewModelWithQuery> {
    let matchedPostsWithSkip = await this.postModel
      .find()
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();

    const matchedPosts = await this.postModel.find({}).exec();

    matchedPostsWithSkip = await Promise.all(
      matchedPostsWithSkip.filter(async (post) => {
        const blog = await this.blogModel.findOne({ _id: post.blogId });
        return !blog.isBanned;
      }),
    );
    const pagesCount = Math.ceil(matchedPosts.length / pageSize);
    const matchedPostsWithLikes = await Promise.all(
      matchedPostsWithSkip.map(async (post) => {
        const mappedPost = await this.helpers.postMapperToView(post);
        const lastLikes = await this.likeModel
          .find({ entityId: post.id, status: LikeInfoViewModelValues.like })
          .sort({ dateAdded: -1 })
          .limit(3)
          .exec();
        mappedPost.extendedLikesInfo.newestLikes = lastLikes.map((e) => {
          return {
            addedAt: e.dateAdded,
            userId: e.userId,
            login: e.userLogin,
          };
        });
        if (!userId) {
          return mappedPost;
        }

        const myLikeForComment = await this.likeModel
          .findOne({
            userId,
            entityId: post.id,
          })
          .exec();
        if (myLikeForComment) {
          mappedPost.extendedLikesInfo.myStatus = myLikeForComment.status;
          return mappedPost;
        }
        return mappedPost;
      }),
    );
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedPosts.length,
      items: matchedPostsWithLikes,
    };
  }
}
