import { InjectModel } from '@nestjs/mongoose';
import { Token, TokenDocument } from '../../../DB/Schemas/token.schema';
import { Model } from 'mongoose';
import {
  RecoveryPassword,
  recoveryPasswordDocument,
} from '../../../DB/Schemas/recovery-password.schema';
import { User } from '../../../DB/Schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { Helpers } from '../../Helpers/helpers';

Injectable();
export class securityRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    public helpers: Helpers,
  ) {}
  async getSessions(userId: string) {
    const devices = await this.tokenModel.find({ userId }).exec();
    return devices.map(this.helpers.deviceMapperToView);
  }
  async deleteSessions(userId: string, deviceId: string) {
    return this.tokenModel.deleteMany({ userId, deviceId: { $ne: deviceId } });
  }
  async deleteSession(userId: string, id: string) {
    try {
      await this.getSession(userId, id);
      return await this.tokenModel.deleteOne({ userId: userId, deviceId: id });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
  async getSession(userId: string, id: string): Promise<Token> {
    const session = await this.tokenModel.findOne({ deviceId: id });
    if (!session) {
      throw new Error('404');
    } else {
      if (session?.userId !== userId) {
        throw new Error('403');
      } else {
        return session;
      }
    }
  }
}
