import { PostViewModel } from '../../DTO/Post/post-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../DB/Schemas/post.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { Injectable } from '@nestjs/common';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostEntity } from '../../DB/Entities/post.entity';

Injectable();
export class PostsRepository {
  constructor(
    public helpers: Helpers,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async createPost(post: Post) {
    const query =
      'insert into post_entity (title, "shortDescription", content, "createdAt", "blogId")  values ($1,$2,$3,$4,$5) returning *,(select name from blog_entity where id = $5) as "blogName"';
    const resolvedPost = await this.dataSource.query(query, [
      post.title,
      post.shortDescription,
      post.content,
      post.createdAt,
      post.blogId,
    ]);
    console.log(resolvedPost);
    return this.helpers.postMapperToViewSql(resolvedPost[0]);
  }
  async updatePost(
    blogId: string,
    title: string,
    content: string,
    shortDescription: string,
    id: string,
  ): Promise<boolean> {
    const query =
      'UPDATE post_entity SET "title" = $1, "shortDescription" = $2, content = $3 where  id = $4';
    const [, updateResult] = await this.dataSource.query(query, [
      title,
      shortDescription,
      content,
      id
    ]);
    return updateResult > 0;
  }
  async deletePost(id: string): Promise<boolean> {
    const query = 'DELETE FROM post_entity WHERE "id" = $1 RETURNING *';
    const [, deleteResult] = await this.dataSource.query(query, [id]);
    return deleteResult > 0;
  }
  async getPost(id: string, userId: string): Promise<PostViewModel | null> {
    const queryResult = await this.dataSource.query(
      `
    SELECT p.*, b."isBanned" AS "blogIsBanned",b.name as "blogName"
    FROM post_entity AS p
    LEFT JOIN blog_entity AS b ON p."blogId" = b.id
    WHERE p.id = $1`,
      [id],
    );

    const result = queryResult[0];

    if (!result) {
      return null;
    }

    const blogIsBanned = result.blogIsBanned;

    if (blogIsBanned) {
      return null;
    }

    let likesCount = await this.dataSource.query(
      'select * from like_entity where "entityId" = $1 and status = $2',
      [id, LikeInfoViewModelValues.like],
    );
    let dislikesCount = await this.dataSource.query(
      'select * from like_entity where "entityId" = $1 and status = $2',
      [id, LikeInfoViewModelValues.dislike],
    );

    const postToView = await this.helpers.postMapperToViewSql({ ...result, dislikesCount:dislikesCount.length, likesCount:likesCount.length });

    const likeQuery = `
    SELECT l."createdAt", l."userId", u.login AS "userLogin"
    FROM like_entity AS l
    LEFT JOIN user_entity AS u ON l."userId" = u.id
    WHERE l."entityId" = $1 AND l.status = $2 AND u."isBanned" = $3
    ORDER BY l."createdAt" DESC
    LIMIT 3`;

    const lastLikes = await this.dataSource.query(likeQuery, [
      id,
      LikeInfoViewModelValues.like,
      false,
    ]);
    postToView.extendedLikesInfo.newestLikes = lastLikes.map((e) => ({
      addedAt: e.createdAt,
      userId: e.userId,
      login: e.userLogin,
    }));

    if (!userId) {
      return postToView;
    }

    const likeStatusQuery = `
    SELECT status
    FROM like_entity
    WHERE "userId" = $1 AND "entityId" = $2`;

    const likeStatusResult = await this.dataSource.query(likeStatusQuery, [
      userId,
      id,
    ]);
    const likeStatus = likeStatusResult[0];

    postToView.extendedLikesInfo.myStatus =
      likeStatus?.status || LikeInfoViewModelValues.none;

    return postToView;
  }
  async updateLikeStatus(
    likeStatus: LikeInfoViewModelValues,
    userId: string,
    postId: string,
    login: string,
  ) {
    const post = await this.dataSource.query(
      'select *  from post_entity where id = $1',
      [postId],
    );
    if (!post[0]) {
      return false;
    }
    const like = await this.dataSource.query(
      'select *  from like_entity where "entityId" = $1 and "userId" = $2',
      [postId, userId],
    );
    if (!like[0]) {
      const insertLikeQuery = `
      INSERT INTO like_entity ("entityId", "userId", "status", "createdAt")
      VALUES ($1, $2, $3, $4)`;

      const insertLikeValues = [postId, userId, likeStatus, new Date()];
      await this.dataSource.query(insertLikeQuery, insertLikeValues);
    } else {
      if (likeStatus === LikeInfoViewModelValues.none) {
        const deleteLikeQuery = `
        DELETE FROM like_entity
        WHERE "entityId" = $1 AND "userId" = $2`;

        await this.dataSource.query(deleteLikeQuery, [postId, userId]);
      } else {
        const updateLikeQuery = `
        UPDATE like_entity
        SET status = $1
        WHERE "entityId" = $2 AND "userId" = $3`;

        await this.dataSource.query(updateLikeQuery, [
          likeStatus,
          postId,
          userId,
        ]);
      }
    }

    return true;
  }
}
