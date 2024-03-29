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

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(BannedUsersForBlog.name)
    private bannedUsersForModel: Model<BannedUsersForBlogDocument>,
    public helpers: Helpers,
  ) {}
  async createUser(user: User): Promise<UserViewModel> {
    const createdUser = new this.userModel(user);
    const newUser = await createdUser.save();
    return this.helpers.userMapperToView(newUser);
  }

  async deleteUser(userId: string): Promise<number> {
    const result = await this.userModel.deleteOne({ _id: userId }).exec();
    return result.deletedCount;
  }

  async updateUser(userId: string, field: string, value) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.confirmationCode': value } },
    );
    return result.modifiedCount;
  }

  async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ result: UserDocument; field: 'login' | 'email' }> {
    const resultByLogin = await this.userModel.findOne({
      'accountData.login': login,
    });
    const resultByEmail = resultByLogin
      ? null
      : await this.userModel.findOne({ 'accountData.email': email });
    return (
      {
        result: resultByLogin || resultByEmail,
        field: resultByLogin ? 'login' : 'email',
      } || null
    );
  }
  async getUserByCode(value: string): Promise<UserDocument> {
    const result = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': value,
    });
    return result || null;
  }
  async getUserById(id: string): Promise<UserDocument> {
    const result = await this.userModel.findOne({ _id: id });
    return result || null;
  }
  async confirmCode(userId: string) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }
  async updateUserBanStatus(
    userId: string,
    banReason: string,
    banDate: string,
    banStatus: boolean,
  ) {
    const updateStatus = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'banInfo.isBanned': banStatus,
          'banInfo.banReason': banReason,
          'banInfo.banDate': banDate,
        },
      },
    );
    await this.commentModel.updateMany(
      { userId },
      { $set: { isUserBanned: banStatus } },
    );
    await this.likeModel.updateMany(
      { userId },
      { $set: { isUserBanned: banStatus } },
    );
    return updateStatus.modifiedCount === 1;
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
