import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './App/Users/user.controller';
import { UserService } from './App/Users/user.service';
import { UserRepository } from './App/Users/user.repository';
import { Helpers } from './App/Helpers/helpers';
import { UserQueryRepository } from './App/Query/user.query.repository';
import { UserSchema } from './DB/Schemas/user.schema';
import { AppRepository } from './app.repository';
import { CommentSchema } from './DB/Schemas/comment.schema';
import { BlogSchema } from './DB/Schemas/blog.schema';
import { PostSchema } from './DB/Schemas/post.schema';
import { CommentController } from './App/Comments/comment.controller';
import { PostController } from './App/Post/post.controller';
import { BlogController } from './App/Blog/blog.controller';
import { PostQueryRepository } from './App/Query/post.query.repository';
import { BlogQueryRepository } from './App/Query/blog.query.repository';
import { CommentQueryRepository } from './App/Query/comment.query.repository';
import { CommentService } from './App/Comments/comment.service';
import { PostService } from './App/Post/posts.service';
import { BlogsService } from './App/Blog/blogs.service';
import { CommentRepository } from './App/Comments/comment.repository';
import { PostsRepository } from './App/Post/posts.repository';
import { BlogRepository } from './App/Blog/blog.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './App/Auth/auth.module';
import { MailService } from './App/Auth/Mail/mail.service';
import { TokenSchema } from './DB/Schemas/token.schema';
import { LikeSchema } from './DB/Schemas/like.schema';
import { blogExisting } from './Middewares/blog-existing.middleware';
import { isBlogExists } from './DTO/Post/post-input-model';
import { ThrottlerModule } from '@nestjs/throttler';
import { securityService } from './App/Auth/Security/security.service';
import { securityRepository } from './App/Auth/Security/security.repository';
import { SecurityController } from './App/Auth/Security/security.controller';
import { RecoveryPasswordSchema } from './DB/Schemas/recovery-password.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BlogBloggerController } from './App/Blog/blog.blogger.controller';
import { AuthRepository } from './App/Auth/auth.repository';
import { BlogSaController } from './App/Blog/blog.sa.controller';
import {
  BannedUsersForBlog,
  BannedUsersForBlogSchema,
} from './DB/Schemas/banned-users-for-blog.schema';
import { UserBloggerController } from './App/Users/user.blogger.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './DB/Entities/user.entity';
import { SessionEntity } from './DB/Entities/session.entity';
import { RecoveryPasswordsEntity } from './DB/Entities/recovery-passwords.entity';
import { PostEntity } from './DB/Entities/post.entity';
import { BlogEntity } from './DB/Entities/blog.entity';
import { LikeEntity } from './DB/Entities/like.entity';
import { UserBlogsBanEntity } from './DB/Entities/user-blogs-ban.entity';
import { CommentEntity } from './DB/Entities/comment.entity';
import { QuestionEntity } from './DB/Entities/question.entity';
import { QuestionsControllerSa } from './App/Questions/questions.sa.controller';
import { QuestionsRepository } from './App/Questions/questions.repository';
import { QuestionsService } from './App/Questions/questions.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Blog', schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
    MongooseModule.forFeature([{ name: 'Like', schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    MongooseModule.forFeature([
      { name: 'BannedUsersForBlog', schema: BannedUsersForBlogSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'RecoveryPassword', schema: RecoveryPasswordSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      RecoveryPasswordsEntity,
      PostEntity,
      BlogEntity,
      LikeEntity,
      UserBlogsBanEntity,
      CommentEntity,
      QuestionEntity,
    ]),
    AuthModule,
    JwtModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'lishchishin.volodea@gmail.com',
          pass: 'uykbtnrylavksddn',
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      host: 'ep-aged-hill-14839329.us-east-2.aws.neon.tech',
      username: 'lishchishin.volodya',
      password: 'PZ5hC2HSUonB',
      database: 'neondb',
      entities: [
        UserEntity,
        SessionEntity,
        RecoveryPasswordsEntity,
        PostEntity,
        BlogEntity,
        LikeEntity,
        UserBlogsBanEntity,
        CommentEntity,
        QuestionEntity,
      ],
      synchronize: true,
      ssl: true,
    }),
  ],
  controllers: [
    AppController,
    UserController,
    CommentController,
    PostController,
    BlogController,
    BlogBloggerController,
    BlogSaController,
    UserBloggerController,
    QuestionsControllerSa,
  ],
  providers: [
    AppService,
    Helpers,
    UserService,
    UserRepository,
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
    isBlogExists,
    JwtService,
    AuthRepository,
    QuestionsRepository,
    QuestionsService,
  ],
  exports: [UserService, UserRepository, Helpers],
})
export class AppModule {}
