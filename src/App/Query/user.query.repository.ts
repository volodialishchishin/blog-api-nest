import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import {
  BannedUsersForBlog,
  BannedUsersForBlogDocument,
} from '../../DB/Schemas/banned-users-for-blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserQueryRepository {
  constructor(
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
      (u.login ILIKE $1
      OR u.email ILIKE $2)
      ${banStatus === 'notBanned' ? 'AND u."isBanned"= false' : ''}
      ${banStatus === 'banned' ? 'AND u."isBanned" = true' : ''}
  `;

    const parameters = [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
      pageSize,
      offset,
    ];
    const parametersWithOutSkip = [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
    ];

    const items = await this.dataSource.query(query, parameters);
    const itemsWithOutSkip = await this.dataSource.query(
      queryWithOutSkip,
      parametersWithOutSkip,
    );

    const pagesCount = Math.ceil(itemsWithOutSkip.length / pageSize);

    return {
      pagesCount,
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: itemsWithOutSkip.length,
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
    const offset = (pageNumber - 1) * pageSize;
    const query = `
    select b.*, u.login  from user_blogs_ban_entity b
    left join user_entity u on b."userId" =  u.id
    WHERE
      u.login ILIKE $1
    ORDER BY
      "${sortBy}" ${sortDirection}
    LIMIT
      $2
    OFFSET
      $3
  `;

    const queryWithOutSkip = `
    select * from user_blogs_ban_entity b
    left join user_entity u on b."userId" =  u.id
    WHERE
      u.login ILIKE $1
    ORDER BY
      "${sortBy}" ${sortDirection}
  `;

    const bannedUserWithSkip = await this.dataSource.query(query, [
      `%${searchLoginTerm}%`,
      pageSize,
      offset,
    ]);

    const totalCount = await this.dataSource.query(queryWithOutSkip, [
      `%${searchLoginTerm}%`,
    ]);
    const pagesCount = Math.ceil(totalCount.length / pageSize);

    const items = bannedUserWithSkip.map((user) => ({
      id: user.userId,
      login: user.login,
      banInfo: {
        isBanned: true,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    }));


    return {
      pagesCount,
      page: Number(pageNumber),
      pageSize:Number(pageSize),
      totalCount:totalCount.length,
      items,
    };
  }
}
