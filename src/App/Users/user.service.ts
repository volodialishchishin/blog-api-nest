import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { User, UserDocument } from '../../Schemas/user.schema';
import { v4 } from 'uuid';
import * as dateFns from 'date-fns';
import * as bcrypt from 'bcrypt';
import { MailService } from '../Auth/Mail/mail.service';
import { AuthRepository } from '../Auth/auth.repository';
import { CommentRepository } from '../Comments/comment.repository';

@Injectable()
export class UserService {
  constructor(
    private userRep: UserRepository,
    private mailService: MailService,
    private authRep: AuthRepository,
  ) {}

  async createUser(user: UserInputModel) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, passwordSalt);
    const resolvedUser: User = {
      accountData: {
        password: passwordHash,
        passwordSalt: passwordSalt,
        login: user.login,
        email: user.email,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: v4(),
        confirmationDate: dateFns.add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        isConfirmed: false,
      },
      banInfo: {
        banDate: null,
        banReason: null,
        isBanned: false,
      },
    };
    await this.mailService.sendMailConfirmation(resolvedUser);
    return this.userRep.createUser(resolvedUser);
  }

  async deleteUser(userId: string): Promise<number> {
    return await this.userRep.deleteUser(userId);
  }
  async updateUser(userId: string, field: string, value): Promise<number> {
    return await this.userRep.updateUser(userId, field, value);
  }

  async getUserByLoginOrEmail(login: string, email: string) {
    const result = await this.userRep.getUserByLoginOrEmail(login, email);

    return result;
  }
  async getUserByField(code: string) {
    const result = await this.userRep.getUserByCode(code);

    return result;
  }

  async confirmCode(user: UserDocument, code: string) {
    if (user.emailConfirmation.confirmationCode === code) {
      return await this.userRep.confirmCode(user.id);
    } else {
      return null;
    }
  }

  async banUser(userId: string, banReason: string) {
    console.log(userId,banReason);
    let banStatus = await this.userRep.updateUserBanStatus(
      userId,
      banReason,
      new Date().toISOString(),
      true,
    );
    console.log(banStatus);
    await this.authRep.deleteAllTokens(userId);
    return !!(banStatus);
  }
  async unbanUser(userId: string) {
    return this.userRep.updateUserBanStatus(
      userId,
      null,
     null,
      false,
    );
  }
}
