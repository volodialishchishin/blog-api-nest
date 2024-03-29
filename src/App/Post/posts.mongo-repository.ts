import { PostViewModel } from '../../DTO/Post/post-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../DB/Schemas/post.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { Injectable } from '@nestjs/common';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';

Injectable();
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    public helpers: Helpers,
  ) {}
  async getPosts(): Promise<PostViewModel[]> {
    const result = await this.postModel.find({}).exec();
    const comments = await Promise.all(
      result.map(this.helpers.postMapperToView),
    );
    return comments;
  }

  async createPost(post: Post) {
    const createdPost = new this.postModel(post);
    const newPost = await createdPost.save();
    return this.helpers.postMapperToView(newPost);
  }
  async updatePost(
    blogId: string,
    title: string,
    content: string,
    shortDescription: string,
    id: string,
  ): Promise<boolean> {
    const result = await this.postModel.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          shortDescription: shortDescription,
          content: content,
          blogId: blogId,
        },
      },
    );
    return result.matchedCount === 1;
  }
  async deletePost(id: string): Promise<number> {
    const result = await this.postModel.deleteOne({ _id: id });
    return result.deletedCount;
  }
  async getPost(id: string, userId: string): Promise<PostViewModel | null> {
    console.log(id);
    const result = await this.postModel.findOne({ _id: id }).exec();
    console.log(result);
    const blog = await this.blogModel.findOne({ _id: result?.blogId });
    if (blog.isBanned) return null;
    if (result) {
      const postToView = await this.helpers.postMapperToView(result);

      const lastLikes = await this.likeModel
        .find({
          entityId: id,
          status: LikeInfoViewModelValues.like,
          isUserBanned: false,
        })
        .sort({ dateAdded: -1 })
        .limit(3)
        .exec();
      postToView.extendedLikesInfo.newestLikes = lastLikes.map((e) => {
        return {
          addedAt: e.dateAdded,
          userId: e.userId,
          login: e.userLogin,
        };
      });
      if (!userId) {
        return postToView;
      }
      const likeStatus = await this.likeModel.findOne({ userId, entityId: id });
      if (likeStatus) {
        postToView.extendedLikesInfo.myStatus =
          likeStatus?.status || LikeInfoViewModelValues.none;
      }
      return postToView;
    } else {
      return undefined;
    }
  }

  async getPostDocument(id: string): Promise<PostDocument> {
    console.log(id);
    const result = await this.postModel.findOne({ _id: id }).exec();
    return result;
  }
  async updateLikeStatus(
    likeStatus: LikeInfoViewModelValues,
    userId: string,
    postId: string,
    login: string,
  ) {
    const post = await this.postModel.findOne({ _id: postId });
    if (!post) {
      return false;
    }
    const like = await this.likeModel.findOne({ entityId: postId, userId });
    if (!like) {
      const status: Like = {
        entityId: postId,
        userId,
        status: likeStatus,
        dateAdded: new Date(),
        userLogin: login,
        isUserBanned: false,
      };
      const like = await this.likeModel.create(status);
      await like.save();
    } else {
      if (likeStatus === LikeInfoViewModelValues.none) {
        await this.likeModel.deleteOne({
          userId: like.userId,
          entityId: like.entityId,
        });
      } else {
        await this.likeModel.updateOne(
          { entityId: postId, userId },
          { $set: { status: likeStatus } },
        );
      }
    }
    return true;
  }
}
