import { PostViewModel } from '../../DTO/Post/post-view-model';
import { Post } from '../../Schemas/post.schema';
import { LikeType } from '../../@types/Like/like.type';
import { PostsRepository } from './posts.repository';
import { BlogsService } from '../Blog/blogs.service';
import { Injectable } from '@nestjs/common';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';

@Injectable()
export class PostService {
  constructor(private blog: BlogsService, private postRep: PostsRepository) {}

  async getPosts(): Promise<PostViewModel[]> {
    return this.postRep.getPosts();
  }

  async createPost(
    blogId: string,
    title: string,
    content: string,
    shortDescription: string,
    blogName: string,
    userId:string
  ): Promise<PostViewModel> {
    let newPost: Post;
    newPost = {
      blogName: blogName,
      shortDescription,
      content,
      blogId,
      title,
      blogOwnerId:userId,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        newestLikes: [],
        myStatus: LikeType.none,
      },
      createdAt: new Date().toISOString(),
    };
    return this.postRep.createPost(newPost);
  }
  async updatePost(
    blogId: string,
    title: string,
    content: string,
    shortDescription: string,
    id: string,
  ): Promise<boolean> {
    return await this.postRep.updatePost(
      blogId,
      title,
      content,
      shortDescription,
      id,
    );
  }
  async deletePost(id: string): Promise<number> {
    return this.postRep.deletePost(id);
  }
  async getPost(id: string, userId: string): Promise<PostViewModel> {
    return this.postRep.getPost(id, userId);
  }

  async updateLikeStatus(
    likeStatus,
    userId: string,
    postId: string,
    login: string,
  ) {
    return this.postRep.updateLikeStatus(likeStatus, userId, postId, login);
  }


}
