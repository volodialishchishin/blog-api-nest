import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Helpers } from '../Helpers/helpers';
import { UserViewModelWithQuery } from '../../DTO/User/user-view-model.dto';
import { UserEntity } from '../../DB/Entities/user.entity';
import { UserBlogsBanEntity } from '../../DB/Entities/user-blogs-ban.entity';

@Injectable()
export class UserQueryRepository {
  private userRepository: Repository<UserEntity>;
  private userBlogsBanRepository: Repository<UserBlogsBanEntity>;

  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    public helpers: Helpers,
  ) {
    this.userRepository = this.dataSource.getRepository(UserEntity);
    this.userBlogsBanRepository =
      this.dataSource.getRepository(UserBlogsBanEntity);
  }

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

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('(user.login ILIKE :loginTerm OR user.email ILIKE :emailTerm)', {
        loginTerm: `%${searchLoginTerm}%`,
        emailTerm: `%${searchEmailTerm}%`,
      });

    if (banStatus === 'notBanned') {
      queryBuilder.andWhere('user.isBanned = false');
    } else if (banStatus === 'banned') {
      queryBuilder.andWhere('user.isBanned = true');
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      pagesCount: Math.ceil(total / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: total,
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

    const queryBuilder = this.userBlogsBanRepository
      .createQueryBuilder('ban')
      .leftJoinAndSelect('ban.user', 'user')
      .where('user.login ILIKE :loginTerm', {
        loginTerm: `%${searchLoginTerm}%`,
      })
      .andWhere('ban.blogId = :blogId', { blogId })
      .orderBy(`ban.${sortBy}`, sortDirection === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    const mappedItems = items.map((ban) => ({
      id: ban.user.id,
      login: ban.user.login,
      banInfo: {
        isBanned: true,
        banDate: ban.banDate,
        banReason: ban.banReason,
      },
    }));

    return {
      pagesCount: Math.ceil(total / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: total,
      items: mappedItems,
    };
  }
}
