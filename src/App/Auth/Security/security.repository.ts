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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

Injectable();
export class securityRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {}
  async getSessions(userId: string) {
    const query = 'select * from session_entity where "userId" = $1';
    const sessions = await this.dataSource.query(query, [userId]);
    return sessions.map(this.helpers.deviceMapperToViewSql);
  }
  async deleteSessions(userId: string, deviceId: string) {
    const query =
      'DELETE FROM session_entity WHERE "userId" = $1 and not "deviceId" = $2';
    const [, deleteResult] = await this.dataSource.query(query, [
      userId,
      deviceId,
    ]);
    return deleteResult > 0;
  }
  async deleteSession(userId: string, id: string) {
    try {
      const query =
        'DELETE FROM session_entity WHERE "userId" = $1 and "deviceId" = $2 RETURNING *';
      await this.getSession(userId, id);
      const [, deleteResult] = await this.dataSource.query(query, [userId, id]);
      return deleteResult > 0;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
  async getSession(userId: string, id: string): Promise<Token> {
    const query = 'select * from session_entity where "deviceId" = $1';
    const session = await this.dataSource.query(query, [id]);
    if (!session[0]) {
      throw new Error('404');
    } else {
      if (session[0]?.userId !== userId) {
        throw new Error('403');
      } else {
        return session[0];
      }
    }
  }
}
