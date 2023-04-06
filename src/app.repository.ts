import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from './Helpers/helpers';
import {Post, PostDocument} from "./Schemas/post.schema";
import {Blog, BlogDocument} from "./Schemas/blog.schema";

@Injectable()
export class AppRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    public helpers: Helpers,
  ) {}

  deleteAll() {
     this.userModel.deleteMany({}).exec();
     this.postModel.deleteMany({}).exec();
     this.blogModel.deleteMany({}).exec();
     return
  }
}
