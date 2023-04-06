import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { Post, PostDocument } from '../Schemas/post.schema';
import { PostViewModelWithQuery } from '../DTO/Post/post-view-model';
import { Blog, BlogDocument } from '../Schemas/blog.schema';
import { BlogViewModelWithQuery } from '../DTO/Blog/blog-view-model';

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    public helpers: Helpers,
  ) {}
  async getBlogs(
    searchNameTerm = '',
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<BlogViewModelWithQuery> {
    const matchedBlogsWithSkip = await this.blogModel
      .find({
        name: searchNameTerm
          ? { $regex: searchNameTerm, $options: 'gi' }
          : { $regex: '.' },
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort({ sortBy: sortDirection })
      .exec();

    const matchedBlogs = await this.blogModel
      .find({
        name: searchNameTerm
          ? { $regex: searchNameTerm, $options: 'gi' }
          : { $regex: '.' },
      })
      .sort({ sortBy: sortDirection })
      .exec();
    const pagesCount = Math.ceil(matchedBlogs.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedBlogs.length,
      items: matchedBlogsWithSkip.map(this.helpers.blogMapperToView),
    };
  }

  async getPostsRelatedToBlog(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
    blogId: string,
  ): Promise<PostViewModelWithQuery> {
    const matchedUsersWithSkip = await this.postModel
      .find({ blogId: blogId })
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort({ sortBy: sortDirection })
      .exec();

    const matchedPosts = await this.postModel.find({ blogId: blogId }).exec();
    const pagesCount = Math.ceil(matchedPosts.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedPosts.length,
      items: matchedUsersWithSkip.map(this.helpers.postMapperToView),
    };
  }
}
