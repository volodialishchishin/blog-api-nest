import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import {
  BannedUsersForBlog,
  BannedUsersForBlogDocument,
} from '../../Schemas/banned-users-for-blog.schema';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class UserQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BannedUsersForBlog.name)
    private bannedUsersForModel: Model<BannedUsersForBlogDocument>,
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {}
  async getUsers(
    searchLoginTerm = '',
    searchEmailTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    banStatus: string,
  ): Promise<UserViewModelWithQuery> {
    const offset = (pageNumber - 1) * pageSize;

    const query = `
    SELECT
      *
    FROM
      user_entity u
    WHERE
      (u.login ILIKE $1
      OR u.email ILIKE $2)
      ${banStatus === 'notBanned' ? 'AND u."isBanned"= false' : ''}
      ${banStatus === 'banned' ? 'AND u."isBanned" = true' : ''}
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $3
    OFFSET
      $4
  `;

    const queryWithOutSkip = `
    SELECT
      *
    FROM
      user_entity u
    WHERE
      u.login ILIKE $1
      OR u.email ILIKE $2
      ${banStatus === 'notBanned' ? 'AND NOT u."isBanned"' : ''}
      ${banStatus === 'banned' ? 'AND u."isBanned"' : ''}
  `;

    console.log();

    const parameters = [ `%${searchLoginTerm}%`, `%${searchEmailTerm}%`, pageSize, offset ];
    const parametersWithOutSkip = [ `%${searchLoginTerm}%`, `%${searchEmailTerm}%` ];

    const items = await this.dataSource.query(query, parameters);
    const itemsWithOutSkip = await this.dataSource.query(queryWithOutSkip, parametersWithOutSkip);

    const pagesCount = Math.ceil(itemsWithOutSkip.length / pageSize);

    return {
      pagesCount,
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount:items.length,
      items: items.map(this.helpers.userMapperToViewSql),
    };
  }

  async getBannedUsersForBlog(
    searchLoginTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    blogId: string,
  ) {
    if (sortBy === 'login') {
      sortBy = 'userLogin';
    }

    const filterObject = {
      userLogin: { $regex: searchLoginTerm, $options: 'i' },
      blogId: blogId,
      isBanned: true,
    };

    const bannedUserWithSkip = await this.bannedUsersForModel
      .find(filterObject)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .exec();

    const totalCount = await this.bannedUsersForModel
      .countDocuments(filterObject)
      .exec();
    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = bannedUserWithSkip.map((user) => ({
      id: user.userId,
      login: user.userLogin,
      banInfo: {
        isBanned: true,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    }));

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }
}
