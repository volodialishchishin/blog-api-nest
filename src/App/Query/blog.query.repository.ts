import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { Post, PostDocument } from '../../DB/Schemas/post.schema';
import { PostViewModelWithQuery } from '../../DTO/Post/post-view-model';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';
import { BlogViewModelWithQuery } from '../../DTO/Blog/blog-view-model';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {}
  async getBlogs(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<BlogViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;

    console.log(offset);

    const query = `
    SELECT
      *
    FROM
      blog_entity b
    WHERE
      (b.name ILIKE $1)   and b."isBanned" = false
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $2
    OFFSET
      $3
  `;

    const queryWithOutSkip = `
    SELECT
      *
    FROM
      blog_entity b 
    WHERE
      (b.name ILIKE $1)   and b."isBanned" = false
    ORDER BY
      "${sortBy}" ${sortDirection}
  `;

    const parameters = [`%${searchNameTerm}%`, pageSize, offset];
    const parametersWithOutSkip = [`%${searchNameTerm}%`];

    const items = await this.dataSource.query(query, parameters);
    const itemsWithOutSkip = await this.dataSource.query(
      queryWithOutSkip,
      parametersWithOutSkip,
    );

    const pagesCount = Math.ceil(itemsWithOutSkip.length / pageSize);

    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: itemsWithOutSkip.length,
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


    const query = `
    SELECT
      *
    FROM
      blog_entity b
    WHERE
      (b.name ILIKE $1)  and b."userId" = $4  and b."isBanned" = false
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $2
    OFFSET
      $3
  `;

    const queryWithOutSkip = `
    SELECT
      *
    FROM
      blog_entity b 
    WHERE
      (b.name ILIKE $1)  and b."userId" = $2 and b."isBanned" = false
    ORDER BY
      "${sortBy}" ${sortDirection}
  `;

    const parameters = [`%${searchNameTerm}%`, pageSize, offset, userId];
    const parametersWithOutSkip = [`%${searchNameTerm}%`, userId];

    const items = await this.dataSource.query(query, parameters);
    const itemsWithOutSkip = await this.dataSource.query(
      queryWithOutSkip,
      parametersWithOutSkip,
    );

    const pagesCount = Math.ceil(itemsWithOutSkip.length / pageSize);

    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: itemsWithOutSkip.length,
      items: items.map(this.helpers.blogMapperToViewSql),
    };
  }

  async getBlogsSa(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<BlogViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const query = `
    select b.id, b.name, b.description, b."websiteUrl", b."createdAt", b."isBanned", b."banDate", b."isMembership", b."userId", u.login from blog_entity b
    left join user_entity u on b."userId" =  u.id
    WHERE
      b.name ILIKE $1
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $2
    OFFSET
      $3
  `;

    const queryWithOutSkip = `
    SELECT
      *
    FROM
      blog_entity b
    WHERE
      b.name ILIKE $1
    ORDER BY
      "${sortBy}" ${sortDirection}
  `;

    const parameters = [`%${searchNameTerm}%`, pageSize, offset];
    const parametersWithOutSkip = [`%${searchNameTerm}%`];

    const items = await this.dataSource.query(query, parameters);
    const itemsWithOutSkip = await this.dataSource.query(
      queryWithOutSkip,
      parametersWithOutSkip,
    );

    const pagesCount = Math.ceil(itemsWithOutSkip.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: itemsWithOutSkip.length,
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
    const query = `
    SELECT
      p.*, b.name as "blogName"
    FROM
      post_entity p
    inner join 
    blog_entity b on b.id = p."blogId"
    where b."isBanned" = false and b.id = $3
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $1
    OFFSET
      $2
  `;
    const items = await this.dataSource.query(query, [
      pageSize,
      offset,
      blogId,
    ]);

    const queryWithOutSkip = `
    SELECT
      p.*
    FROM
      post_entity p
    inner join 
    blog_entity b on b.id = p."blogId"
    where b."isBanned" = false and b.id = $1
  `;
    const itemsWithOutSkip = await this.dataSource.query(queryWithOutSkip, [
      blogId,
    ]);
    const pagesCount = Math.ceil(items.length / pageSize);
    const itemsWithLikes = await Promise.all(
      items.map(async (post) => {
        let likesCount = await this.dataSource.query(
          'select * from like_entity where "entityId" = $1 and status = $2',
          [post.id, LikeInfoViewModelValues.like],
        );
        let dislikeCount = await this.dataSource.query(
          'select * from like_entity where "entityId" = $1 and status = $2',
          [post.id, LikeInfoViewModelValues.dislike],
        );

        const lastLikesQuery = `
        SELECT l."createdAt", l."userId", u.login AS "userLogin"
        FROM like_entity l
        LEFT JOIN user_entity u ON l."userId" = u.id
        WHERE l."entityId" = $1 AND l.status = 'Like' 
        ORDER BY l."createdAt" DESC
        LIMIT 3`;
        const lastLikes = await this.dataSource.query(lastLikesQuery, [
          post.id,
        ]);
        const mappedPost = await this.helpers.postMapperToViewSql({
          ...post,
          likesCount: likesCount.length,
          dislikeCount: dislikeCount.length,
          blogName: post.blogName,
        });
        mappedPost.extendedLikesInfo.newestLikes = lastLikes.map((e) => {
          return {
            addedAt: e.createdAt,
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
