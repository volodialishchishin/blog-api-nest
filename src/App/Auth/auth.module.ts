import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './Strategies/jwt.strategy';
import { BasicStrategy } from './Strategies/basic.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UserService } from '../Users/user.service';
import { UserRepository } from '../Users/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../DB/Schemas/user.schema';
import { Helpers } from '../Helpers/helpers';
import { MailService } from './Mail/mail.service';
import { AuthRepository } from './auth.repository';
import { TokenSchema } from '../../DB/Schemas/token.schema';
import { LikeSchema } from '../../DB/Schemas/like.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  RecoveryPassword,
  RecoveryPasswordSchema,
} from '../../DB/Schemas/recovery-password.schema';
import { securityService } from './Security/security.service';
import { securityRepository } from './Security/security.repository';
import { SecurityController } from './Security/security.controller';
import { CommentSchema } from '../../DB/Schemas/comment.schema';
import { BannedUsersForBlogSchema } from '../../DB/Schemas/banned-users-for-blog.schema';
import { BlogSchema } from '../../DB/Schemas/blog.schema';
import { SessionEntity } from '../../DB/Entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../DB/Entities/user.entity';
import { RecoveryPasswordsEntity } from '../../DB/Entities/recovery-passwords.entity';
import { PostEntity } from '../../DB/Entities/post.entity';
import { BlogEntity } from '../../DB/Entities/blog.entity';
import { LikeEntity } from '../../DB/Entities/like.entity';
import { UserBlogsBanEntity } from '../../DB/Entities/user-blogs-ban.entity';
import { CommentEntity } from '../../DB/Entities/comment.entity';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10000,
      limit: 1000,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: { expiresIn: '100m' },
      }),
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
    ]),
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: 'Like', schema: LikeSchema }]),
    MongooseModule.forFeature([
      { name: 'RecoveryPassword', schema: RecoveryPasswordSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'BannedUsersForBlog', schema: BannedUsersForBlogSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Blog', schema: BlogSchema }]),
  ],
  controllers: [AuthController, SecurityController],
  providers: [
    AuthService,
    BasicStrategy,
    JwtStrategy,
    UserService,
    UserRepository,
    Helpers,
    MailService,
    AuthRepository,
    securityService,
    securityRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
