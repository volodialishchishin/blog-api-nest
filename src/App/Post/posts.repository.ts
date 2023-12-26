import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../../DB/Entities/post.entity';
import { PostViewModel } from '../../DTO/Post/post-view-model';
import { Helpers } from '../Helpers/helpers';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { LikeEntity } from '../../DB/Entities/like.entity';

@Injectable()
export class PostsRepository {
  constructor(
    public helpers: Helpers,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  async createPost(postData: PostEntity): Promise<PostViewModel> {
    const newPost = this.postRepository.create(postData);
    const savedPost = await this.postRepository.save(newPost);
    return this.helpers.postMapperToViewSql(savedPost);
  }

  async updatePost(id: string, updateData): Promise<boolean> {
    const updateResult = await this.postRepository.update(id, updateData);
    return updateResult.affected > 0;
  }

  async deletePost(id: string): Promise<boolean> {
    const deleteResult = await this.postRepository.delete(id);
    return deleteResult.affected > 0;
  }

  async getPost(id: string, userId: string): Promise<PostViewModel | null> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['blog'],
    });

    if (!post || post.blog.isBanned) {
      return null;
    }

    return this.helpers.postMapperToViewSql(post);
  }

  async updateLikeStatus(
    likeStatus: LikeInfoViewModelValues,
    userId: string,
    postId: string,
  ): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { entityId: postId, userId },
    });

    if (!like) {
      await this.likeRepository.save({
        entityId: postId,
        userId,
        status: likeStatus,
        createdAt: new Date().toISOString(),
      });
    } else {
      if (likeStatus === LikeInfoViewModelValues.none) {
        const deleteStatus = await this.likeRepository.delete({
          entityId: postId,
          userId,
        });
      } else {
        await this.likeRepository.update(
          { entityId: postId, userId },
          { status: likeStatus },
        );
      }
    }

    return true;
  }
}
