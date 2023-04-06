import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { User } from '../../Schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private userRep: UserRepository) {}

  async createUser(user: UserInputModel) {
    const resolvedUser: User = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    return this.userRep.createUser(resolvedUser);
  }

  async deleteUser(userId: string):Promise<number> {
    let result = await this.userRep.deleteUser(userId);
    return  result
  }
}
