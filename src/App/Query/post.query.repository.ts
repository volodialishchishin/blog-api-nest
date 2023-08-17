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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
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
    const query = `
    SELECT
      p.*, b.name as "blogName"
    FROM
      post_entity p
    inner join 
    blog_entity b on b.id = p."blogId"
    where b."isBanned" = false
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $1
    OFFSET
      $2
  `;
    const items = await this.dataSource.query(query, [pageSize, offset]);

    const queryWithOutSkip = `
    SELECT
      p.*
    FROM
      post_entity p
    inner join 
    blog_entity b on b.id = p."blogId"
    where b."isBanned" = false
  `;
    const itemsWithOutSkip = await this.dataSource.query(queryWithOutSkip, []);
    const pagesCount = Math.ceil(items.length / pageSize);
    const itemsWithLikes = await Promise.all(
      items.map(async (post) => {
        let likesCount = await this.dataSource.query(
          'select * from like_entity inner join user_entity u on u.id = like_entity."userId" where "entityId" = $1 and status = $2 and u."isBanned" = false',
          [post.id, LikeInfoViewModelValues.like],
        );
        let dislikeCount = await this.dataSource.query(
          'select * from like_entity  inner join user_entity u on u.id = like_entity."userId" where "entityId" = $1 and status = $2   and u."isBanned" = false',
          [post.id, LikeInfoViewModelValues.dislike],
        );

        const lastLikesQuery = `
        SELECT l."createdAt", l."userId", u.login AS "userLogin"
        FROM like_entity l
        LEFT JOIN user_entity u ON l."userId" = u.id
        WHERE l."entityId" = $1 AND l.status = 'Like' and u."isBanned" = false 
        ORDER BY l."createdAt" DESC
        LIMIT 3`;
        const lastLikes = await this.dataSource.query(lastLikesQuery, [
          post.id,
        ]);
        const mappedPost = await this.helpers.postMapperToViewSql({
          ...post,
          likesCount: likesCount.length,
          dislikesCount: dislikeCount.length,
          blogName: post.blogName,
        });
        mappedPost.extendedLikesInfo.newestLikes = lastLikes.map((e) => {
          return {
            addedAt: e.createdAt.toString(),
            userId: e.userId,
            login: e.userLogin,
          };
        });

        if (!userId) {
          return mappedPost;
        }

        const myLikeForComment = await this.dataSource.query(
          'select * from like_entity where "userId" = $1 and "entityId" = $2',
          [userId, mappedPost.id],
        );
        if (myLikeForComment[0]) {
          mappedPost.extendedLikesInfo.myStatus = myLikeForComment[0].status;
          return mappedPost;
        }
        return mappedPost;
      }),
    );
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: itemsWithOutSkip.length,
      items: itemsWithLikes,
    };
  }
}
