import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from './App/Helpers/helpers';
import { Post, PostDocument } from './Schemas/post.schema';
import { Blog, BlogDocument } from './Schemas/blog.schema';
import { Comment, CommentDocument } from "./Schemas/comment.schema";
import { Token, TokenDocument } from "./Schemas/token.schema";
import { Like, LikeDocument } from "./Schemas/like.schema";

@Injectable()
export class AppRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    public helpers: Helpers,
  ) {}

  deleteAll() {
    this.userModel.deleteMany({}).exec();
    this.postModel.deleteMany({}).exec();
    this.blogModel.deleteMany({}).exec();
    this.commentModel.deleteMany({}).exec();
    this.tokenModel.deleteMany({}).exec();
    this.likeModel.deleteMany({}).exec();
    return;
  }
}
