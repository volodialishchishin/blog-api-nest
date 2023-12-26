import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../DB/Entities/user.entity';
import { UserBlogsBanEntity } from '../../DB/Entities/user-blogs-ban.entity';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { BlogEntity } from '../../DB/Entities/blog.entity';
import { User } from '../../DB/Schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserBlogsBanEntity)
    private readonly userBlogsBanRepository: Repository<UserBlogsBanEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    public helpers: Helpers,
  ) {}

  async createUser(user): Promise<UserViewModel> {
    const resolvedUser = {
      password: user.accountData.password,
      passwordSalt: user.accountData.passwordSalt,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      emailConfirmationCode: user.emailConfirmation.confirmationCode,
      emailConfirmationDate: user.emailConfirmation.confirmationDate,
      isEmailConfirmed: user.emailConfirmation.isConfirmed,
      banDate: user.banInfo.banDate,
      banReason: user.banInfo.banReason,
      isBanned: user.banInfo.isBanned,
    };
    const newUser = this.userRepository.create(resolvedUser);
    await this.userRepository.save(newUser);
    console.log(newUser);
    return this.helpers.userMapperToViewSql(newUser);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.delete(userId);
    return result.affected > 0;
  }

  async updateUser(
    userId: string,
    updateData: Partial<UserEntity>,
  ): Promise<boolean> {
    const result = await this.userRepository.update({ id: userId }, updateData);
    return result.affected > 0;
  }

  async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ result: User & { id: string }; field: 'login' | 'email' }> {
    const result = await this.userRepository.findOne({
      where: [{ login: login }, { email: email }],
    });

    if (result) {
      const user = result;
      const field = user.login === login ? 'login' : 'email';
      return { result: this.helpers.userMapperToDocument(user) || null, field };
    } else {
      return null;
    }
  }

  async getUserByCode(value: string): Promise<User & { id: string }> {
    const result = this.userRepository.findOne({
      where: { emailConfirmationCode: value },
    });
    return result[0] ? this.helpers.userMapperToDocument(result[0]) : null;
  }

  async getUserById(id: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { id } });
  }

  async confirmCode(userId: string): Promise<boolean> {
    const result = await this.userRepository.update(userId, {
      isEmailConfirmed: true,
    });
    return result.affected > 0;
  }

  async updateUserBanStatus(
    userId: string,
    banReason: string,
    banDate: string,
    banStatus: boolean,
  ): Promise<boolean> {
    const result = await this.userRepository.update(userId, {
      isBanned: banStatus,
      banReason: banReason,
      banDate: new Date(banDate).toISOString(),
    });
    return result.affected > 0;
  }

  async unbanUserForBlog(userId: string, blogId: string): Promise<boolean> {
    const result = await this.userBlogsBanRepository.delete({
      userId: userId,
      blogId: blogId,
    });
    return result.affected > 0;
  }

  async banUserForBlog(
    userId: string,
    blogId: string,
    banReason: string,
    banDate: string,
  ): Promise<boolean> {
    const ban = this.userBlogsBanRepository.create({
      userId: userId,
      blogId: blogId,
      banReason: banReason,
      banDate: new Date(banDate).toISOString(),
    });
    await this.userBlogsBanRepository.save(ban);
    return true;
  }

  async isUserBanned(userId: string, postId: string): Promise<boolean> {
    const qb = this.userBlogsBanRepository
      .createQueryBuilder('userBan')
      .innerJoin('post_entity', 'post', 'post.blogId = userBan.blogId')
      .where('userBan.userId = :userId', { userId })
      .andWhere('post.id = :postId', { postId });

    const userBan = await qb.getOne();
    return !!userBan;
  }

  async checkIfUserHasAccessToBan(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const blog = await this.blogRepository.findOne({ where: { id: blogId } });
    return blog?.userId === userId;
  }
}
