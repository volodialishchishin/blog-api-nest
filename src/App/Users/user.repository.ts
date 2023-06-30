import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public helpers: Helpers,
  ) {}
  async createUser(user: User): Promise<UserViewModel> {
    const createdUser = new this.userModel(user);
    const newUser = await createdUser.save();
    return this.helpers.userMapperToView(newUser);
  }

  async deleteUser(userId: string): Promise<number> {
    const result = await this.userModel.deleteOne({ _id: userId }).exec();
    return result.deletedCount;
  }

  async getUserByLoginOrEmail(login:string,email:string): Promise<UserDocument> {
    const result = await this.userModel.findOne({$or:[{'accountData.login':login},{'accountData.email':email}]})
    return result || null
  }
}
