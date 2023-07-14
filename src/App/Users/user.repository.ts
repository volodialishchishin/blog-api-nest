import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public helpers: Helpers,
  ) {}
  async createUser(user: User): Promise<UserViewModel> {
    console.log(user);
    const createdUser = new this.userModel(user);
    const newUser = await createdUser.save();
    return this.helpers.userMapperToView(newUser);
  }

  async deleteUser(userId: string): Promise<number> {
    const result = await this.userModel.deleteOne({ _id: userId }).exec();
    return result.deletedCount;
  }

  async updateUser(userId: string, field: string, value) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.confirmationCode': value } }
    );
    return result.modifiedCount;
  }

  async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ result: UserDocument; field: 'login' | 'email' }> {
    const resultByLogin = await this.userModel.findOne({
      'accountData.login': login,
    });
    const resultByEmail = resultByLogin
      ? null
      : await this.userModel.findOne({ 'accountData.email': email });
    return (
      {
        result: resultByLogin || resultByEmail,
        field: resultByLogin ? 'login' : 'email',
      } || null
    );
  }
  async getUserByCode( value:string): Promise<UserDocument> {
    const result = await this.userModel.findOne({ 'emailConfirmation.confirmationCode': value });
    return result || null;
  }
  async getUserByCId( id:string): Promise<UserDocument> {
    const result = await this.userModel.findOne({ _id:id });
    return result || null;
  }
  async confirmCode(userId: string) {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }
}
