import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { Injectable } from '@nestjs/common';
import { Token, TokenDocument } from '../../DB/Schemas/token.schema';
import {
  RecoveryPassword,
  recoveryPasswordDocument,
} from '../../DB/Schemas/recovery-password.schema';
import { User } from '../../DB/Schemas/user.schema';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';

Injectable();
export class AuthRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    @InjectModel(RecoveryPassword.name)
    private recoveryPasswordModel: Model<recoveryPasswordDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    public helpers: Helpers,
  ) {}
  async findTokenByUserId(userId: string, deviceId: string) {
    return this.tokenModel.findOne({ userId: userId, deviceId: deviceId });
  }

  async getRefreshToken(token: string) {
    return this.tokenModel.findOne({ refreshToken: token }).exec();
  }
  async getUserByRecoveryCode(recoveryCode: string): Promise<UserViewModel> {
    return this.helpers.userMapperToView(
      await this.recoveryPasswordModel.findOne({ code: recoveryCode }),
    );
  }

  async updateToken(userId: string, refreshToken: string, deviceId: string) {
    return this.tokenModel.updateOne(
      { userId: userId, deviceId },
      { $set: { refreshToken, lastActiveDate: new Date().toISOString() } },
    );
  }
  async deleteToken(token: string) {
    const result = await this.tokenModel
      .deleteOne({ refreshToken: token })
      .exec();
    return result.deletedCount === 1;
  }
  async updateUserPassword(
    userId: string,
    newPassword: string,
    passwordSalt: string,
  ) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'accountData.passwordSalt': passwordSalt,
          'accountData.password': newPassword,
        },
      },
    );
    return result.modifiedCount === 1;
  }
  async createToken(token: Token) {
    const createdToken = new this.tokenModel(token);
    return await createdToken.save();
  }
  async savePasswordRecoveryCode(userId: string, code: string) {
    const createdCode = new this.recoveryPasswordModel({ userId, code });
    return await createdCode.save();
  }

  async deleteAllTokens(userId: string) {
    const deleteResult = await this.tokenModel.deleteMany({ userId });
    return deleteResult.deletedCount === 1;
  }
}
