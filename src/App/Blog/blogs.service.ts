import { BlogViewModel } from '../../DTO/Blog/blog-view-model';
import { BlogRepository } from './blog.repository';
import { Blog } from '../../Schemas/blog.schema';
import { BlogInputModel } from '../../DTO/Blog/blog-input-model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsService {
  constructor(private blogRep: BlogRepository) {}

  async createBlog(blog: BlogInputModel, user): Promise<BlogViewModel> {
    const newBlog: Blog = {
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      description: blog.description,
      userId: user.userId,
      userLogin: user.login,
      isBanned: false,
      banDate: null,
    };
    return this.blogRep.createBlog(newBlog);
  }

  async checkIfBlogBelongsToUser(id: string, userId: string): Promise<boolean> {
    return this.blogRep.checkIfBlogBelongsToUser(id, userId);
  }

  async updateBlog(
    name: string,
    websiteUrl: string,
    description: string,
    id: string,
  ): Promise<boolean> {
    return this.blogRep.updateBlog(name, websiteUrl, description, id);
  }
  async deleteBlog(id: string) {
    return this.blogRep.deleteBlog(id);
  }
  async getBlog(id: string): Promise<BlogViewModel | null> {
    const blog = this.blogRep.getBlog(id);
    return blog;
  }

  async bindBlog(blogId: string, userId: string): Promise<boolean> {
    return this.blogRep.bindBlog(blogId, userId);
  }
  async banBlog(blogId: string): Promise<boolean> {
    return this.blogRep.updateBanStatusOfBlog(
      blogId,
      new Date().toISOString(),
      true,
    );
  }
  async unbanBlog(blogId: string): Promise<boolean> {
    return this.blogRep.updateBanStatusOfBlog(blogId, null, false);
  }
}
