import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../Users/user.repository';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../Schemas/user.schema';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { config } from 'rxjs';
import { AuthRepository } from './auth.repository';

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

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkCredentials(login: string, password: string, email: string) {
    const matchedUser = await this.userRep.getUserByLoginOrEmail(login, email);
    if (!matchedUser) return null;
    const passwordHash = await bcrypt.hash(
      password,
      matchedUser.result.accountData.passwordSalt,
    );
    if (matchedUser.result.accountData.password === passwordHash) {
      return matchedUser.result;
    }
  }

  generateTokens(user: UserDocument) {
    const accessToken = this.jwtService.sign(
      {
        user: user.id,
        email: user.accountData.email,
        login: user.accountData.login,
      },
      { secret: this.configService.get('SECRET') },
    );
    const refreshToken = this.jwtService.sign(
      { user: user.id },
      { secret: this.configService.get('SECRET'), expiresIn: '60m' },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: string, refreshToken: string, ip: string) {
    const { deviceId } = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('SECRET'),
    });
    const tokenData = await this.authRepository.findTokenByUserId(userId);
    if (tokenData) {
      const status = await this.authRepository.updateToken(
        userId,
        refreshToken,
      );
      return status.modifiedCount;
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
}
