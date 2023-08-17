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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionEntity } from '../../DB/Entities/session.entity';
import { isUUID } from 'class-validator';

Injectable();
export class AuthRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    @InjectModel(RecoveryPassword.name)
    private recoveryPasswordModel: Model<recoveryPasswordDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {}
  async findTokenByUserId(userId: string, deviceId: string) {
    const query =
      'select * from session_entity where "userId" = $1 and "deviceId" = $2';
    const token = await this.dataSource.query(query, [userId, deviceId]);
    return token[0];
  }

  async getRefreshToken(token: string) {
    const query = 'select * from session_entity where "refreshToken" = $1';
    const resolvedToken = await this.dataSource.query(query, [token]);
    return resolvedToken[0];
  }
  async getUserByRecoveryCode(recoveryCode: string): Promise<UserViewModel> {
    const query = 'SELECT * FROM user_entity WHERE code = $1';
    const user = await this.dataSource.query(query, [recoveryCode]);
    return query ? this.helpers.userMapperToView(user[0]) : null;
  }

  async updateToken(userId: string, refreshToken: string, deviceId: string) {
    const query =
      'UPDATE session_entity SET "refreshToken" = $1, "lastActiveDate" = $2 WHERE "userId" = $3 AND "deviceId" = $4';
    const [, updateResult] = await this.dataSource.query(query, [
      refreshToken,
      new Date().toISOString(),
      userId,
      deviceId,
    ]);
    return updateResult > 0;
  }
  async deleteToken(token: string) {
    const query =
      'DELETE FROM session_entity WHERE "refreshToken" = $1 RETURNING *';
    const [, deleteResult] = await this.dataSource.query(query, [token]);
    return deleteResult > 0;
  }
  async updateUserPassword(
    userId: string,
    newPassword: string,
    passwordSalt: string,
  ) {
    const query =
      'UPDATE user_entity SET "passwordSalt" = $1, password = $2 WHERE "userId" = $3 RETURNING *';
    const [, updateResult] = await this.dataSource.query(query, [
      passwordSalt,
      newPassword,
      userId,
    ]);
    return updateResult > 0;
  }
  async createToken(token: Token) {
    const query =
      'insert into session_entity("userId", "refreshToken", ip, title, "lastActiveDate", "deviceId") values ($1,$2,$3,$4,$5,$6) RETURNING *';
    const resolvedToken = await this.dataSource.query(query, [
      token.userId,
      token.refreshToken,
      token.ip,
      token.title,
      token.lastActiveDate,
      token.deviceId,
    ]);
    return resolvedToken[0];
  }
  async savePasswordRecoveryCode(userId: string, code: string) {
    const query =
      'INSERT INTO recovery_passwords_entity ("userId", code) VALUES ($1, $2) RETURNING *';
    const resolvedToken = await this.dataSource.query(query, [userId, code]);
    return resolvedToken[0];
  }

  async deleteAllTokens(userId: string) {
    const query = 'DELETE FROM session_entity WHERE "userId" = $1';
    const [, deleteResult] = await this.dataSource.query(query, [userId]);
    return deleteResult > 0;
  }
}
