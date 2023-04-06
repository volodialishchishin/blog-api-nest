import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from './Helpers/helpers';

@Injectable()
export class AppRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public helpers: Helpers,
  ) {}

  deleteAll() {
    return this.userModel.deleteMany({}).exec();
  }
}
