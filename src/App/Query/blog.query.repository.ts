import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BlogViewModelSA,
  BlogViewModelWithQuery,
} from '../../DTO/Blog/blog-view-model';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { LikeEntity } from '../../DB/Entities/like.entity';
import { Helpers } from '../Helpers/helpers';
import { PostEntity } from '../../DB/Entities/post.entity';
import { BlogEntity } from '../../DB/Entities/blog.entity';
import { PostViewModelWithQuery } from '../../DTO/Post/post-view-model';

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    public helpers: Helpers,
  ) {}

  async getBlogs(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<BlogViewModelWithQuery> {
    // Calculate offset
    const offset = (pageNumber - 1) * pageSize;

    // Use QueryBuilder to fetch items
    const [items, total] = await this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.name ILIKE :searchTerm', {
        searchTerm: `%${searchNameTerm}%`,
      })
      .andWhere('blog.isBanned = false')
      .orderBy(`blog.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    // Calculate total pages
    const pagesCount = Math.ceil(total / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: total,
      items: items.map(this.helpers.blogMapperToViewSql),
    };
  }

  async getBlogsRelatedToUser(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId?: string,
  ): Promise<BlogViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const [items, total] = await this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.name ILIKE :searchTerm', {
        searchTerm: `%${searchNameTerm}%`,
      })
      .andWhere('blog.userId = :userId', { userId })
      .andWhere('blog.isBanned = false')
      .orderBy(`blog.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    const pagesCount = Math.ceil(total / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: total,
      items: items.map(this.helpers.blogMapperToViewSql),
    };
  }
  async getBlogsSa(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ) {
    const offset = (pageNumber - 1) * pageSize;
    const [items, total] = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.user', 'user')
      .select([
        'blog.id',
        'blog.name',
        'blog.description',
        'blog.websiteUrl',
        'blog.createdAt',
        'blog.isBanned',
        'blog.banDate',
        'blog.isMembership',
        'blog.userId',
        'user.login',
      ])
      .where('blog.name ILIKE :searchTerm', {
        searchTerm: `%${searchNameTerm}%`,
      })
      .orderBy(`blog.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    const pagesCount = Math.ceil(total / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: total,
      // @ts-ignore
      items: items.map(this.helpers.blogMapperToViewSaSql),
    };
  }

  async getPostsRelatedToBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    blogId: string,
    userId: string,
  ): Promise<PostViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const [items, total] = await this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.blog', 'blog')
      .where('blog.isBanned = false')
      .andWhere('blog.id = :blogId', { blogId })
      .orderBy(`post.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    const itemsWithLikes = await Promise.all(
      items.map(async (post) => {
        const likesCount = await this.likeRepository.count({
          where: { entityId: post.id, status: LikeInfoViewModelValues.like },
        });
        const dislikesCount = await this.likeRepository.count({
          where: { entityId: post.id, status: LikeInfoViewModelValues.dislike },
        });

        const lastLikes = await this.likeRepository
          .createQueryBuilder('like')
          .leftJoinAndSelect('like.user', 'user')
          .where('like.entityId = :postId AND like.status = :status', {
            postId: post.id,
            status: 'Like',
          })
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
          addedAt: e.createdAt,
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

  // ... other methods
}
