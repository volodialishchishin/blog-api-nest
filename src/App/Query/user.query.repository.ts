import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';

@Injectable()
export class UserQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public helpers: Helpers,
  ) {}
  async getUsers(
    searchLoginTerm = '',
    searchEmailTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    banStatus: string
  ): Promise<UserViewModelWithQuery> {
    let filterObject:any = {
      $or: [
        {
          'accountData.login': searchLoginTerm
            ? { $regex: searchLoginTerm, $options: 'i' }
            : { $regex: '.' },
        },
        {
          'accountData.email': searchEmailTerm
            ? { $regex: searchEmailTerm, $options: 'i' }
            : { $regex: '.' },
        },
      ]
    }
    if (banStatus === 'notBanned'){
       filterObject = {
        $or: [
          {
            'accountData.login': searchLoginTerm
              ? { $regex: searchLoginTerm, $options: 'i' }
              : { $regex: '.' },
          },
          {
            'accountData.email': searchEmailTerm
              ? { $regex: searchEmailTerm, $options: 'i' }
              : { $regex: '.' },
          },
        ],
        "banInfo.isBanned": false
      }
    }
    else if( banStatus === 'banned'){
       filterObject = {
        $or: [
          {
            'accountData.login': searchLoginTerm
              ? { $regex: searchLoginTerm, $options: 'i' }
              : { $regex: '.' },
          },
          {
            'accountData.email': searchEmailTerm
              ? { $regex: searchEmailTerm, $options: 'i' }
              : { $regex: '.' },
          },
        ],
        'banInfo.isBanned': true
      }
    }
    let sortByField = sortBy
      ? `accountData.${sortBy}`
      : `accountData.createdAt`;
    const matchedUsersWithSkip = await this.userModel
      .find(filterObject)
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortByField, sortDirection]])
      .exec();
    const matchedUsers = await this.userModel
      .find(filterObject)
      .exec();
    const pagesCount = Math.ceil(matchedUsers.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedUsers.length,
      items: matchedUsersWithSkip.map(this.helpers.userMapperToView),
    };
  }
}
