import jwt from 'jsonwebtoken';
import { DeleteResult } from 'mongodb';
import { securityRepository } from './security.repository';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class securityService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly securityRepository: securityRepository,
  ) {}
  async getSessions(refreshToken: string) {
    const { user, deviceId } = await this.jwtService.verifyAsync<{
      user: string;
      deviceId: string;
    }>(refreshToken, { secret: process.env.SECRET || 'Ok' });
    return await this.securityRepository.getSessions(user);
  }
  async deleteSessions(refreshToken: string) {
    const { user, deviceId } = await this.jwtService.verifyAsync<{
      user: string;
      deviceId: string;
    }>(refreshToken, { secret: process.env.SECRET || 'Ok' });
    return await this.securityRepository.deleteSessions(user, deviceId);
  }
  async deleteSession(refreshToken: string, id: string): Promise<any> {
    const { user, deviceId } = await this.jwtService.verifyAsync<{
      user: string;
      deviceId: string;
    }>(refreshToken, { secret: process.env.SECRET || 'Ok' });
    try {
      await this.securityRepository.deleteSession(user, id);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}
