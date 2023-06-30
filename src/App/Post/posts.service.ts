import { PostViewModel } from '../../DTO/Post/post-view-model';
import { Post } from '../../Schemas/post.schema';
import { LikeType } from '../../Types/Like/like.type';
import { PostsRepository } from './posts.repository';
import { BlogsService } from '../Blog/blogs.service';
import { Injectable } from '@nestjs/common';

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
  ): Promise<PostViewModel> {
    let newPost: Post;
    newPost = {
      blogName: blogName,
      shortDescription,
      content,
      blogId,
      title,
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
  async getPost(id: string): Promise<PostViewModel> {
    return this.postRep.getPost(id);
  }
}
