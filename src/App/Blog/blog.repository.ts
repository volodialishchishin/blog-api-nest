import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogViewModel } from '../../DTO/Blog/blog-view-model';
import { Helpers } from '../Helpers/helpers';
import { BlogEntity } from '../../DB/Entities/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    public helpers: Helpers,
  ) {}

  async createBlog(blog): Promise<BlogViewModel> {
    const savedBlog = await this.blogRepository.save(blog);
    return this.helpers.blogMapperToViewSql(savedBlog);
  }

  async updateBlog(
    name: string,
    websiteUrl: string,
    description: string,
    id: string,
  ): Promise<boolean> {
    const updateResult = await this.blogRepository.update(id, {
      name,
      websiteUrl,
      description,
    });
    return updateResult.affected > 0;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const deleteResult = await this.blogRepository.delete(id);
    return deleteResult.affected > 0;
  }

  async getBlog(id: string): Promise<BlogViewModel> {
    const blog = await this.blogRepository.findOne({
      where: { id, isBanned: false },
    });
    return blog ? this.helpers.blogMapperToViewSql(blog) : null;
  }

  async checkIfBlogBelongsToUser(
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    const blog = await this.blogRepository.findOne({
      where: { id: blogId, userId },
    });
    return !!blog;
  }

  async bindBlog(blogId: string, userId: string): Promise<boolean> {
    const blog = await this.blogRepository.findOne({ where: { id: blogId } });
    if (!blog || blog.userId) return false;

    blog.userId = userId;
    const updateResult = await this.blogRepository.save(blog);
    return !!updateResult;
  }

  async updateBanStatusOfBlog(
    blogId: string,
    banDate: Date,
    status: boolean,
  ): Promise<boolean> {
    const updateResult = await this.blogRepository.update(blogId, {
      isBanned: status,
      banDate: status ? banDate.toISOString() : null,
    });
    return updateResult.affected > 0;
  }
}
