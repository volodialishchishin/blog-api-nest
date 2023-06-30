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
import { Helpers } from '../../Helpers/helpers';
import { MailService } from './Mail/mail.service';
import { AuthRepository } from './auth.repository';
import { TokenSchema } from '../../Schemas/token.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    BasicStrategy,
    JwtStrategy,
    UserService,
    UserRepository,
    Helpers,
    MailService,
    AuthRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
