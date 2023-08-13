import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { Like, LikeDocument } from '../../Schemas/like.schema';
import { Comment, CommentDocument } from '../../Schemas/comment.schema';
import {
  BannedUsersForBlog,
  BannedUsersForBlogDocument,
} from '../../Schemas/banned-users-for-blog.schema';
import { Blog, BlogDocument } from '../../Schemas/blog.schema';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserEntity } from "../../DB/Entities/user.entity";

@Injectable()
export class UserRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(BannedUsersForBlog.name) private bannedUsersForModel : Model<BannedUsersForBlogDocument>
  ) {}
  async createUser(user: User): Promise<UserViewModel> {
    const query =
      'insert into user_entity(password, "passwordSalt", email, login, "createdAt", "emailConfirmationCode", "emailConfirmationDate", "isEmailConfirmed", "isBanned", "banDate", "banReason") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
    const resolvedUser:Array<UserEntity> = await this.dataSource.query(query, [
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
      user.banInfo.banReason
    ]);
    return this.helpers.userMapperToViewSql(resolvedUser[0]);

  }

  async deleteUser(userId: string): Promise<number> {
    const query =
      'DELETE FROM user_entity WHERE id = $1 ';
    const [,deleteResult] = await this.dataSource.query(query, [userId]);
    return deleteResult;
  }

  async updateUser(userId: string, field: string, value) {

    const query = 'UPDATE user_entity SET "emailConfirmationCode" = $1 WHERE "id" = $2 RETURNING *';
    const [,updateResult] = await this.dataSource.query(query, [
      value,
      userId,
    ]);
    return updateResult;
  }

  async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ result: User & {id:string} ; field: 'login' | 'email' }> {
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
  async getUserByCode(value: string): Promise<User & {id:string}> {
    const query =
      'select * from user_entity where "emailConfirmationCode" = $1';
    console.log(value);
    const user = await this.dataSource.query(query, [value]);
    return user[0] ? this.helpers.userMapperToDocument(user[0]) : null
  }
  async getUserById(id: string): Promise<UserDocument> {
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

    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
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

    const [,updateResult] = await this.dataSource.query(query, parameters);
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

    const [,updateResult] = await this.dataSource.query(query, parameters);

    return updateResult > 0;
  }

  async updateBanStatus(
    userId: string,
    blogId: string,
    banReason: string,
    banDate: string,
    status: boolean,
  ) {
    const user = await this.getUserById(userId);
    if (!user) return null;
    const userBanForBlog = await this.bannedUsersForModel.findOne({
      userId,
      blogId,
    });
    if (!userBanForBlog) {
      const createdBan = new this.bannedUsersForModel({
        userId,
        userLogin: user?.accountData?.login,
        blogId,
        banReason,
        banDate,
        isBanned: status,
      });
      return await createdBan.save();
    } else {
      const updateResult = await this.bannedUsersForModel
        .updateOne(
          { userId, blogId },
          { $set: { banReason, banDate, isBanned: status } },
        )
        .exec();
      return updateResult.modifiedCount === 1;
    }
  }

  async isUserBanned(userId: string, blogId: string) {
    const userBan = await this.bannedUsersForModel.findOne({
      userId,
      blogId,
      isBanned: true,
    });
    console.log(userBan);
    return userBan ? userBan : null;
  }

  async checkIfUserHasAccessToBan(userId: string, blogId: string) {
    const blog = await this.blogModel.findOne({ _id: blogId });
    return blog.userId === userId;
  }
}
