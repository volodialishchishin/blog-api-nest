import { BlogViewModel } from '../../DTO/Blog/blog-view-model';
import { BlogRepository } from './blog.repository';
import { Blog } from '../../Schemas/blog.schema';
import { BlogInputModel } from '../../DTO/Blog/blog-input-model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsService {
  constructor(private blogRep: BlogRepository) {}

  async createBlog(blog: BlogInputModel): Promise<BlogViewModel> {
    const newBlog: Blog = {
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      description: blog.description,
    };
    return this.blogRep.createBlog(newBlog);
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
}
