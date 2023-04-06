import { BlogViewModel } from '../../DTO/Blog/blog-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../../Helpers/helpers';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../Schemas/blog.schema';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    public helpers: Helpers,
  ) {}

  async createBlog(blog: Blog): Promise<BlogViewModel> {
    const createdBlog = new this.blogModel(blog);
    const newBlog = await createdBlog.save();
    return this.helpers.blogMapperToView(newBlog);
  }
  async updateBlog(
    name: string,
    websiteUrl: string,
    description: string,
    id: string,
  ): Promise<boolean> {
    const result = await this.blogModel.updateOne(
      { _id: id },
      {
        $set: { websiteUrl: websiteUrl, name: name, description: description },
      },
    );
    return result.modifiedCount === 1;
  }
  async deleteBlog(id: string) {
    return await this.blogModel.findOneAndRemove({ _id: id }).exec();
  }
  async getBlog(id: string): Promise<BlogViewModel> {
    const blog = await this.blogModel.findOne({ _id: id }).exec();
    return blog ? this.helpers.blogMapperToView(blog) : null;
  }
}
