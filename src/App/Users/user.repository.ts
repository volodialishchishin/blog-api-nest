import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { Like, LikeDocument } from '../../DB/Schemas/like.schema';
import { Comment, CommentDocument } from '../../DB/Schemas/comment.schema';
import {
  BannedUsersForBlog,
  BannedUsersForBlogDocument,
} from '../../DB/Schemas/banned-users-for-blog.schema';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../DB/Entities/user.entity';
import { UserBlogsBanEntity } from '../../DB/Entities/user-blogs-ban.entity';
import { BlogEntity } from '../../DB/Entities/blog.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {}
  async createUser(user: User): Promise<UserViewModel> {
    const query =
      'insert into user_entity(password, "passwordSalt", email, login, "createdAt", "emailConfirmationCode", "emailConfirmationDate", "isEmailConfirmed", "isBanned", "banDate", "banReason") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
    const resolvedUser: Array<UserEntity> = await this.dataSource.query(query, [
      user.accountData.password,
      user.accountData.passwordSalt,
      user.accountData.email,
      user.accountData.login,
      user.accountData.createdAt,
      user.emailConfirmation.confirmationCode,
      user.emailConfirmation.confirmationDate,
      user.emailConfirmation.isConfirmed,
      user.banInfo.isBanned,
      user.banInfo.banDate,
      user.banInfo.banReason,
    ]);
    return this.helpers.userMapperToViewSql(resolvedUser[0]);
  }

  async deleteUser(userId: string): Promise<number> {
    const query = 'DELETE FROM user_entity WHERE id = $1 ';
    const [, deleteResult] = await this.dataSource.query(query, [userId]);
    return deleteResult;
  }

  async updateUser(userId: string, field: string, value) {
    const query =
      'UPDATE user_entity SET "emailConfirmationCode" = $1 WHERE "id" = $2 RETURNING *';
    const [, updateResult] = await this.dataSource.query(query, [
      value,
      userId,
    ]);
    return updateResult;
  }

  async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ result: User & { id: string }; field: 'login' | 'email' }> {
    const query = `
    SELECT
      *
    FROM
      user_entity u
    WHERE
      u.login = $1
      OR u.email = $2
    LIMIT
      1
  `;

    const parameters = [login, email];

    const result = await this.dataSource.query(query, parameters);

    if (result.length > 0) {
      const user = result[0];
      const field = user.login === login ? 'login' : 'email';
      return { result: this.helpers.userMapperToDocument(user) || null, field };
    } else {
      return null;
    }
  }
  async getUserByCode(value: string): Promise<User & { id: string }> {
    const query =
      'select * from user_entity where "emailConfirmationCode" = $1';
    console.log(value);
    const user = await this.dataSource.query(query, [value]);
    return user[0] ? this.helpers.userMapperToDocument(user[0]) : null;
  }
  async getUserById(id: string): Promise<User & { id: string }> {
    const query = `
    SELECT
      *
    FROM
      user_entity u
    WHERE
      u.id = $1
    LIMIT
      1
  `;

    const parameters = [id];

    const result = await this.dataSource.query(query, parameters);

    return result[0] ? this.helpers.userMapperToDocument(result[0]) : null;
  }
  async confirmCode(userId: string) {
    const query = `
    UPDATE
      user_entity
    SET
      "isEmailConfirmed" = true
    WHERE
      id = $1
  `;

    const parameters = [userId];

    const [, updateResult] = await this.dataSource.query(query, parameters);
    console.log(updateResult);

    return updateResult > 0;
  }
  async updateUserBanStatus(
    userId: string,
    banReason: string,
    banDate: string,
    banStatus: boolean,
  ) {
    const query = `
    UPDATE
      user_entity
    SET
      "isBanned" = $1,
      "banReason" = $2,
      "banDate" = $3
    WHERE
      id = $4
    RETURNING *
  `;

    const parameters = [banStatus, banReason, banDate, userId];

    const [, updateResult] = await this.dataSource.query(query, parameters);

    return updateResult > 0;
  }

  async unbanUserForBlog(userId:string, blogId:string){
    const user = await this.getUserById(userId);
    if (!user) return null;
    const updateUserBanQuery = `
      delete from user_blogs_ban_entity where id= $1 and "blogId" = $2`;

    const updateUserBanValues = [userId, blogId];
    await this.dataSource.query(updateUserBanQuery, updateUserBanValues);
    return  true
  }

  async banUserForBlog(userId:string, blogId:string, banReason:string, banDate:string){
    console.log(userId);
    const user = await this.getUserById(userId);
    if (!user) return null;
    const insertUserBanQuery = `
      INSERT INTO user_blogs_ban_entity ("userId", "blogId", "banReason", "banDate")
      VALUES ($1,$2,$3,$4)`;

    const insertUserBanValues = [userId, blogId, banReason, banDate];
    await this.dataSource.query(insertUserBanQuery, insertUserBanValues);
    return true;
  }

  async isUserBanned(userId: string, postId: string) {
    const userBan = await this.dataSource.query(
      'select * from user_blogs_ban_entity where (select p."blogId"  from post_entity p  where p.id = $1 ) = user_blogs_ban_entity."blogId" and user_blogs_ban_entity."userId" = $2',
      [postId,userId ],
    );
    console.log(userId, postId);
    return userBan[0] ? userBan[0] : null;
  }

  async checkIfUserHasAccessToBan(userId: string, blogId: string) {
    const blog: BlogEntity = await this.dataSource.query(
      'select * from blog_entity where id = $1',
      [blogId],
    );
    return blog[0].userId === userId;
  }
}
