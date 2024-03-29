import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../Users/user.repository';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { config } from 'rxjs';
import { AuthRepository } from './auth.repository';
import { ObjectId } from 'mongoose';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRep: UserRepository,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = {
      password: 'fdsf',
    };
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  extractDataFromRefreshToken(refreshToken) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkCredentials(login: string, password: string, email: string) {
    const matchedUser = await this.userRep.getUserByLoginOrEmail(login, email);
    if (!matchedUser?.result) return null;
    if (matchedUser.result.banInfo.isBanned) return null;
    const passwordHash = await bcrypt.hash(
      password,
      matchedUser.result.accountData.passwordSalt,
    );
    if (matchedUser.result.accountData.password === passwordHash) {
      return matchedUser.result;
    }
  }

  generateTokens(user, deviceId?: string) {
    const accessToken = this.jwtService.sign(
      {
        user: user.id,
        email: user.accountData.email,
        login: user.accountData.login,
      },
      { secret: this.configService.get('SECRET') },
    );
    const refreshToken = this.jwtService.sign(
      { user: user.id, deviceId: deviceId },
      { secret: this.configService.get('SECRET'), expiresIn: '20s' },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserByRecoveryCode(code: string) {
    return await this.authRepository.getUserByRecoveryCode(code);
  }

  async getUserIdByToken(token: string) {
    try {
      const result: any = await this.jwtService.verifyAsync(token, {
        secret: 'Ok',
      });
      return result;
    } catch (e) {
      return null;
    }
  }

  async processPasswordRecovery(newPassword: string, userId: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, passwordSalt);
    const updateStatus = await this.authRepository.updateUserPassword(
      userId,
      passwordHash,
      passwordSalt,
    );
    return updateStatus;
  }

  async savePasswordRecoveryCode(userId: string, code) {
    return this.authRepository.savePasswordRecoveryCode(userId, code);
  }

  async saveToken(userId: string, refreshToken: string, ip: string) {
    const { deviceId } = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('SECRET'),
    });
    const tokenData = await this.authRepository.findTokenByUserId(
      userId,
      deviceId,
    );
    if (tokenData && tokenData.deviceId === deviceId) {
      const status = await this.authRepository.updateToken(
        userId,
        refreshToken,
        deviceId,
      );
      return status;
    }
    return await this.authRepository.createToken({
      deviceId,
      ip,
      title: deviceId,
      userId,
      refreshToken,
      lastActiveDate: new Date().toISOString(),
    });
  }

  async refresh(refreshToken: string, device: string, ip: string) {
    const userData = await this.validateRefreshToken(refreshToken);
    const tokenFromDb = await this.authRepository.getRefreshToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new Error();
    }
    const user = await this.userRep.getUserById(userData.user);
    console.log(user);
    const tokens = this.generateTokens(user, userData.deviceId);
    console.log(tokens);
    await this.saveToken(user.id, tokens.refreshToken, ip);
    return { ...tokens };
  }
  async validateRefreshToken(refreshToken: string) {
    try {
      const { user, deviceId } = await this.jwtService.verifyAsync<{
        user: string;
        deviceId: string;
      }>(refreshToken, { secret: process.env.SECRET || 'Ok' });

      return {
        user,
        deviceId,
      };
    } catch (e) {
      return null;
    }
  }

  async logout(refreshToken: string) {
    const { user, deviceId } = await this.jwtService.verifyAsync<{
      user: string;
      deviceId: string;
    }>(refreshToken, { secret: process.env.SECRET || 'Ok' });
    const tokenData = await this.authRepository.deleteToken(refreshToken);
    if (!tokenData) {
      throw new Error();
    }
    return tokenData;
  }
}
