import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Helpers } from '../Helpers/helpers';
import { Comment, CommentDocument } from '../../DB/Schemas/comment.schema';
import {
  allCommentsForUserViewModel,
  allCommentsForUserViewModelWithQuery,
  CommentViewModelWithQuery,
} from '../../DTO/Comment/comment-view-model';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';
import { Post, PostDocument } from '../../DB/Schemas/post.schema';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { PostViewModelWithQuery } from "../../DTO/Post/post-view-model";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    public helpers: Helpers,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async getComments(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    postId:string,
    userId: string,
  ): Promise<PostViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const query = `
    SELECT
      c.*, u.login
    FROM
      comment_entity c
    inner join 
    user_entity u on u.id = c."userId"
    where c."postId" = $1
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $2
    OFFSET
      $3
  `;
    const items = await this.dataSource.query(query, [postId, pageSize, offset]);

    const queryWithOutSkip = `
    SELECT
      c.*, u.login
    FROM
      comment_entity c
    inner join 
    user_entity u on u.id = c."userId"
    where c."postId" = $1
  `;
    const itemsWithOutSkip = await this.dataSource.query(queryWithOutSkip, [postId]);
    const pagesCount = Math.ceil(items.length / pageSize);
    const itemsWithLikes = await Promise.all(
      items.map(async (comment) => {
        let likesCount = await this.dataSource.query(
          'select * from like_entity where "entityId" = $1 and status = $2',
          [comment.id, LikeInfoViewModelValues.like],
        );
        let dislikeCount = await this.dataSource.query(
          'select * from like_entity where "entityId" = $1 and status = $2',
          [comment.id, LikeInfoViewModelValues.dislike],
        );

        const mappedComment = await this.helpers.commentsMapperToViewSql({
          ...comment,
          likesCount: likesCount.length,
          dislikeCount: dislikeCount.length,
          login: comment.login
        });

        if (!userId) {
          return mappedComment;
        }

        const myLikeForComment = await this.dataSource.query(
          'select * from like_entity where "userId" = $1 and "entityId" = $2',
          [userId, mappedComment.id],
        );
        if (myLikeForComment[0]) {
          mappedComment.likesInfo.myStatus = myLikeForComment[0].status;
          return mappedComment;
        }
        return mappedComment;
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

  async getAllCommentsForBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<allCommentsForUserViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;
    const comments = await this.dataSource.query(`select c.*, u.login, p.title, p."blogId", b.name from comment_entity c inner join user_entity u on c."userId" = u.id inner join post_entity p on c."postId" = p.id inner join blog_entity b on p."blogId" = b.id ORDER BY "${sortBy}" ${sortDirection} Limit $1 offset $2`, [pageSize,offset])
    const allComments =await this.dataSource.query(`select c.*, u.login, p.title, p."blogId", b.name from comment_entity c inner join user_entity u on c."userId" = u.id inner join post_entity p on c."postId" = p.id inner join blog_entity b on p."blogId" = b.id`, [pageSize,offset])

    const pagesCount = Math.ceil(allComments.length / pageSize);
    const mappedComments: Array<allCommentsForUserViewModel> =
      await Promise.all(
        comments.map(async (comment) => {
          const myLikeForComment = await this.dataSource.query(
            'select * from like_entity where "userId" = $1 and "entityId" = $2',
            [userId, comment.id],
          );
          let likesCount = await this.dataSource.query(
            'select * from like_entity where "entityId" = $1 and status = $2',
            [comment.id, LikeInfoViewModelValues.like],
          );
          let dislikeCount = await this.dataSource.query(
            'select * from like_entity where "entityId" = $1 and status = $2',
            [comment.id, LikeInfoViewModelValues.dislike],
          );
          return {
            id: comment.id.toString(),
            content: comment.content,
            commentatorInfo: {
              userId: comment.userId,
              userLogin: comment.userLogin,
            },
            createdAt: comment.createdAt,
            likesInfo: {
              likesCount: likesCount.length,
              dislikesCount: dislikeCount.length,
              myStatus: myLikeForComment?.status || 'None',
            },
            postInfo: {
              id: comment.id.toString(),
              title: comment.title,
              blogId: comment.blogId,
              blogName: comment.blogName,
            },
          };
        }),
      );
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: allComments.length,
      items: mappedComments.filter(Boolean),
    };
  }
}
