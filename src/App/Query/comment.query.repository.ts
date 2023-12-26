import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Helpers } from '../Helpers/helpers';
import {
  allCommentsForUserViewModel,
  allCommentsForUserViewModelWithQuery,
  CommentViewModelWithQuery,
} from '../../DTO/Comment/comment-view-model';
import { CommentEntity } from '../../DB/Entities/comment.entity';
import { LikeEntity } from '../../DB/Entities/like.entity';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model'; // Check if needed after refactor

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    public helpers: Helpers,
  ) {}

  async getComments(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    postId: string,
    userId: string,
  ): Promise<CommentViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const [items, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId })
      .orderBy(`comment.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    const itemsWithLikes = await Promise.all(
      items.map(async (comment) => {
        const likesCount = await this.likeRepository.count({
          where: { entityId: comment.id, status: LikeInfoViewModelValues.like },
        });
        const dislikesCount = await this.likeRepository.count({
          where: {
            entityId: comment.id,
            status: LikeInfoViewModelValues.dislike,
          },
        });
        const myLikeForComment = userId
          ? await this.likeRepository.findOne({
              where: { userId, entityId: comment.id },
            })
          : null;

        return this.helpers.commentsMapperToViewSql({
          ...comment[0],
          likesCount,
          dislikesCount,
          myStatus: myLikeForComment?.status || 'None',
        });
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

  async getAllCommentsForBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<allCommentsForUserViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('post.blog', 'blog')
      .orderBy(`comment.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize)
      .getMany();

    const totalComments = await this.commentRepository.count();

    const pagesCount = Math.ceil(totalComments / pageSize);
    const mappedComments: Array<allCommentsForUserViewModel> =
      await Promise.all(
        comments.map(async (comment) => {
          const likesCount = await this.likeRepository.count({
            where: {
              entityId: comment.id,
              status: LikeInfoViewModelValues.like,
            },
          });
          const dislikesCount = await this.likeRepository.count({
            where: {
              entityId: comment.id,
              status: LikeInfoViewModelValues.dislike,
            },
          });
          const myLikeForComment = userId
            ? await this.likeRepository.findOne({
                where: { userId, entityId: comment.id },
              })
            : null;

          return {
            id: comment.id.toString(),
            content: comment.content,
            commentatorInfo: {
              userId: comment.user.id,
              userLogin: comment.user.login,
            },
            createdAt: comment.createdAt,
            likesInfo: {
              likesCount,
              dislikesCount,
              myStatus: myLikeForComment?.status || 'None',
            },
            postInfo: {
              id: comment.post.id.toString(),
              title: comment.post.title,
              blogId: comment.post.blog.id,
              blogName: comment.post.blog.name,
            },
          };
        }),
      );

    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: totalComments,
      items: mappedComments.filter(Boolean),
    };
  }
}
