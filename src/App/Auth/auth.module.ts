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
import { UserSchema } from '../../Schemas/user.schema';
import { Helpers } from '../Helpers/helpers';
import { MailService } from './Mail/mail.service';
import { AuthRepository } from './auth.repository';
import { TokenSchema } from '../../Schemas/token.schema';
import { LikeSchema } from '../../Schemas/like.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  RecoveryPassword,
  RecoveryPasswordSchema,
} from '../../Schemas/recovery-password.schema';
import { securityService } from './Security/security.service';
import { securityRepository } from './Security/security.repository';
import { SecurityController } from './Security/security.controller';
import { CommentSchema } from '../../Schemas/comment.schema';
import { BannedUsersForBlogSchema } from '../../Schemas/banned-users-for-blog.schema';
import { BlogSchema } from "../../Schemas/blog.schema";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 24214234,
      limit: 423412432144213421,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: { expiresIn: '1000m' },
      }),
    }),
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
