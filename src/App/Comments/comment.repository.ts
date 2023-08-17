import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { Comment, CommentDocument } from '../../DB/Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { LikeInfoModel } from '../../DTO/LikeInfo/like-info-model';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentEntity } from "../../DB/Entities/comment.entity";

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {}
  async updateComment(id: string, content: string): Promise<boolean> {
    const updateCommentQuery = `
  UPDATE comment_entity
  SET content = $1
  WHERE id = $2`;

    const [,updateResult] = await this.dataSource.query(updateCommentQuery, [content, id]);

    return updateResult>0;
  }
  async deleteComment(id: string): Promise<boolean> {
    const deleteCommentQuery = `
    DELETE FROM comment_entity
    WHERE id = $1`;

    const [,deleteResult] = await this.dataSource.query(deleteCommentQuery, [id]);

    return deleteResult>0;
  }
  async createComment(comment): Promise<CommentViewModel> {
    const query =
      'insert into comment_entity( content, "createdAt", "postId", "userId")  values ($1,$2,$3,$4) RETURNING *';
    const user = await this.dataSource.query('select login from user_entity where id = $1', [comment.userId])
    const resolvedComment: Array<CommentEntity> = await this.dataSource.query(query, [
      comment.content,
      comment.createdAt,
      comment.postId,
      comment.userId
    ]);
    return this.helpers.commentsMapperToViewSql({...resolvedComment[0], login:user[0].login, likesCount:0, disLikesCount:0});
  }

  async getComment(id: string, userId: string) {
    const comment= await this.dataSource.query('select comment_entity.* , u.login from comment_entity inner join user_entity u on comment_entity."userId" = u.id where comment_entity.id = $1 and u."isBanned" = false', [id])
    if (comment[0]) {
      const commentToView = await this.helpers.commentsMapperToViewSql({ ...comment[0], disLikesCount:0, login: comment.login, likesCount:0 });

      if (!userId) {
        return commentToView;
      }
      const likeStatus = await this.dataSource.query('select * from like_entity where "userId" = $1 and "entityId" = $2',[userId, id])
      if (likeStatus[0]) {
        commentToView.likesInfo.myStatus =
          likeStatus[0]?.status || LikeInfoViewModelValues.none;
      }
      return commentToView;
    } else {
      return undefined;
    }
  }
  async updateLikeStatus(
    likeStatus: LikeInfoViewModelValues,
    userId: string,
    commentId: string,
    login: string,
  ) {
    const comment = await this.dataSource.query(
      'select *  from comment_entity where id = $1',
      [commentId],
    );
    if (!comment[0]) {
      return false;
    }
    const like = await this.dataSource.query(
      'select *  from like_entity where "entityId" = $1 and "userId" = $2',
      [commentId, userId],
    );
    if (!like[0]) {
      const insertLikeQuery = `
      INSERT INTO like_entity ("entityId", "userId", "status", "createdAt")
      VALUES ($1, $2, $3, $4)`;

      const insertLikeValues = [commentId, userId, likeStatus, new Date()];
      await this.dataSource.query(insertLikeQuery, insertLikeValues);
    } else {
      if (likeStatus === LikeInfoViewModelValues.none) {
        const deleteLikeQuery = `
        DELETE FROM like_entity
        WHERE "entityId" = $1 AND "userId" = $2`;

        await this.dataSource.query(deleteLikeQuery, [commentId, userId]);
      } else {
        const updateLikeQuery = `
        UPDATE like_entity
        SET status = $1
        WHERE "entityId" = $2 AND "userId" = $3`;

        await this.dataSource.query(updateLikeQuery, [
          likeStatus,
          commentId,
          userId,
        ]);
      }
    return true;
  }}
}
