import { BlogViewModel } from '../../DTO/Blog/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../DB/Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../DB/Schemas/blog.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    public helpers: Helpers,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createBlog(blog: Blog): Promise<BlogViewModel> {
    const query =
      'insert into blog_entity( name, description, "websiteUrl", "createdAt", "isMembership", "isBanned", "banDate", "userId")  values ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *';
    const resolvedBlog = await this.dataSource.query(query, [
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
      blog.isBanned,
      blog.banDate,
      blog.userId,
    ]);
    return this.helpers.blogMapperToViewSql(resolvedBlog[0]);
  }
  async updateBlog(
    name: string,
    websiteUrl: string,
    description: string,
    id: string,
  ): Promise<boolean> {
    const query =
      'UPDATE blog_entity SET "websiteUrl" = $1, "name" = $2, "description" = $3 where "id" = $4';
    const [, updateResult] = await this.dataSource.query(query, [
      websiteUrl,
      name,
      description,
      id,
    ]);
    return updateResult > 0;
  }
  async deleteBlog(id: string) {
    const query = 'DELETE FROM blog_entity WHERE "id" = $1 RETURNING *';
    const [, deleteResult] = await this.dataSource.query(query, [id]);
    return deleteResult > 0;
  }
  async getBlog(id: string): Promise<BlogViewModel> {
    const query =
      'select * from blog_entity where "id" = $1 and not "isBanned"';
    const blog = await this.dataSource.query(query, [id]);
    return blog[0] ? this.helpers.blogMapperToViewSql(blog[0]) : null;
  }
  async checkIfBlogBelongsToUser(id, userId: string) {
    const query = 'select * from blog_entity where "id" = $1 and "userId" = $2';
    const blog = await this.dataSource.query(query, [id, userId]);
    return userId === blog[0]?.userId;
  }

  async bindBlog(id, userId: string): Promise<boolean> {
    const query = 'select * from blog_entity where "id" = $1';
    const blog = await this.dataSource.query(query, [id]);
    if (!blog[0].userId) return false;

    const updateQuery = 'UPDATE blog_entity SET "userId" = $1 WHERE "id" = $2';
    const [, updateResult] = await this.dataSource.query(updateQuery, [
      userId,
      id,
    ]);
    return updateResult > 0;
  }

  async updateBanStatusOfBlog(
    blogId: string,
    banDate: string,
    status: boolean,
  ): Promise<boolean> {
    const updateQuery =
      'UPDATE blog_entity SET "isBanned" = $1, "banDate" = $2 WHERE "id" = $3';
    const [, updateResult] = await this.dataSource.query(updateQuery, [
      status,
      banDate,
      blogId,
    ]);
    return updateResult > 0;
  }
}
