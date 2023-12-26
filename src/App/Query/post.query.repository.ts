import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Helpers } from '../Helpers/helpers';
import { PostViewModelWithQuery } from '../../DTO/Post/post-view-model';
import { PostEntity } from '../../DB/Entities/post.entity';
import { LikeEntity } from '../../DB/Entities/like.entity';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    public helpers: Helpers,
  ) {}

  async getPosts(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<PostViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const [items, total] = await this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.blog', 'blog')
      .where('blog.isBanned = false')
      .orderBy(`post.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    const itemsWithLikes = await Promise.all(
      items.map(async (post) => {
        const likesCount = await this.likeRepository.count({
          where: {
            entityId: post.id,
            status: LikeInfoViewModelValues.like,
            user: { isBanned: false },
          },
        });
        const dislikesCount = await this.likeRepository.count({
          where: {
            entityId: post.id,
            status: LikeInfoViewModelValues.dislike,
            user: { isBanned: false },
          },
        });
        const lastLikes = await this.likeRepository
          .createQueryBuilder('like')
          .leftJoinAndSelect('like.user', 'user')
          .where('like.entityId = :postId AND like.status = :status', {
            postId: post.id,
            status: 'Like',
          })
          .andWhere('user.isBanned = false')
          .orderBy('like.createdAt', 'DESC')
          .limit(3)
          .getMany();

        const mappedPost: any = await this.helpers.postMapperToViewSql({
          ...post,
          likesCount,
          dislikesCount,
          blogName: post.blog.name,
        });
        mappedPost.extendedLikesInfo.newestLikes = lastLikes.map((e) => ({
          addedAt: e.createdAt.toString(),
          userId: e.user.id,
          login: e.user.login,
        }));

        if (userId) {
          const myLikeForComment = await this.likeRepository.findOne({
            where: { userId, entityId: post.id },
          });
          mappedPost.extendedLikesInfo.myStatus = myLikeForComment?.status;
        }

        return mappedPost;
      }),
    );

    return {
      pagesCount: Math.ceil(total / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: total,
      items: itemsWithLikes,
    };
  }
}
