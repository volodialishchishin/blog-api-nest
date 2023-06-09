import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './App/Users/user.controller';
import { UserService } from './App/Users/user.service';
import { UserRepository } from './App/Users/user.repository';
import { Helpers } from './Helpers/helpers';
import { UserQueryRepository } from './Query/user.query.repository';
import { UserSchema } from './Schemas/user.schema';
import { AppRepository } from './app.repository';
import { CommentSchema } from './Schemas/comment.schema';
import { BlogSchema } from './Schemas/blog.schema';
import { PostSchema } from './Schemas/post.schema';
import { CommentController } from './App/Comments/comment.controller';
import { PostController } from './App/Post/post.controller';
import { BlogController } from './App/Blog/blog.controller';
import { PostQueryRepository } from './Query/post.query.repository';
import { BlogQueryRepository } from './Query/blog.query.repository';
import { CommentQueryRepository } from './Query/comment.query.repository';
import { CommentService } from './App/Comments/comment.service';
import { PostService } from './App/Post/posts.service';
import { BlogsService } from './App/Blog/blogs.service';
import { CommentRepository } from './App/Comments/comment.repository';
import { PostsRepository } from './App/Post/posts.repository';
import { BlogRepository } from './App/Blog/blog.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './App/Auth/auth.module';
import { MailService } from './App/Auth/Mail/mail.service';
import { TokenSchema } from "./Schemas/token.schema";
import { LikeSchema } from "./Schemas/like.schema";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Blog', schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: 'Like', schema: LikeSchema }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [
    AppController,
    UserController,
    CommentController,
    PostController,
    BlogController,
  ],
  providers: [
    AppService,
    UserService,
    UserRepository,
    Helpers,
    UserQueryRepository,
    AppRepository,
    PostQueryRepository,
    BlogQueryRepository,
    CommentQueryRepository,
    CommentService,
    PostService,
    BlogsService,
    CommentRepository,
    PostsRepository,
    BlogRepository,
    MailService,
  ],
  exports: [UserService, UserRepository],
})
export class AppModule {}
