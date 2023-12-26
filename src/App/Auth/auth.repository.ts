import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { SessionEntity } from '../../DB/Entities/session.entity';
import { UserEntity } from '../../DB/Entities/user.entity';
import { RecoveryPasswordsEntity } from '../../DB/Entities/recovery-passwords.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RecoveryPasswordsEntity)
    private passwordRecovery: Repository<RecoveryPasswordsEntity>,
    public helpers: Helpers,
  ) {}

  async findTokenByUserId(userId: string, deviceId: string) {
    return this.sessionRepository.findOne({
      where: { userId, deviceId },
    });
  }

  async getRefreshToken(token: string) {
    return this.sessionRepository.findOne({
      where: { refreshToken: token },
    });
  }

  async getUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<RecoveryPasswordsEntity> {
    const user = await this.passwordRecovery.findOne({
      where: { code: recoveryCode },
    });
    return user || null;
  }

  async updateToken(userId: string, refreshToken: string, deviceId: string) {
    const result = await this.sessionRepository.update(
      { userId, deviceId },
      { refreshToken, lastActiveDate: new Date().toISOString() },
    );
    return result.affected > 0;
  }

  async deleteToken(token: string) {
    const result = await this.sessionRepository.delete({ refreshToken: token });
    return result.affected > 0;
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
    passwordSalt: string,
  ) {
    const result = await this.userRepository.update(
      { id: userId },
      { passwordSalt, password: newPassword },
    );
    return result.affected > 0;
  }

  async createToken(token: any) {
    return this.sessionRepository.save(token);
  }

  async savePasswordRecoveryCode(userId: string, code: string) {
    return this.passwordRecovery.save({ userId, code });
  }

  async deleteAllTokens(userId: string) {
    const result = await this.sessionRepository.delete({ userId });
    return result.affected > 0;
  }
}
