import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { BannedUsersForBlog, BannedUsersForBlogDocument } from "../../Schemas/banned-users-for-blog.schema";

@Injectable()
export class UserQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BannedUsersForBlog.name)
    private bannedUsersForModel: Model<BannedUsersForBlogDocument>,
    public helpers: Helpers

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

  async getBannedUsersForBlog(
    searchLoginTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    blogId: string
  ) {
    if (sortBy==='login'){
      sortBy = 'userLogin'
    }
    console.log(blogId);
    const bannedUser = await this.bannedUsersForModel
      .find({
        userLogin:searchLoginTerm
          ? { $regex: searchLoginTerm, $options: 'i' }
          : { $regex: '.' },
        blogId:blogId
      })
      .exec();
    const bannedUserWithSkip = await this.bannedUsersForModel
      .find({
        userLogin: searchLoginTerm
          ? { $regex: searchLoginTerm, $options: 'i' }
          : { $regex: '.' },
        blogId:blogId
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy, sortDirection]])
      .exec();
    const pagesCount = Math.ceil(bannedUser.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: bannedUser.length,
      items: bannedUserWithSkip.map(user=>{
        return{
          id:user.userId,
          login:user.userLogin,
          banInfo:{
            isBanned: true,
            banDate: user.banDate,
            banReason: user.banReason
          }
        }
      })
    };
  }
}
