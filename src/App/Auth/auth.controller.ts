import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './Guards/jwt.auth.guard';
import { BasicAuthGuard } from './Guards/basic.auth.guard';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { UserService } from '../Users/user.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('registration')
  async registration(
    @Request() req,
    @Body() userModel: UserInputModel,
    @Res() response: Response,
  ) {
    const isUserExists = await this.userService.getUserByLoginOrEmail(
      userModel?.login,
      userModel?.email,
    );
    if (isUserExists) {
      throw new BadRequestException([
        {
          message: 'User Exists',
          field: 'emailOrLogin',
        },
      ]);
    }
    await this.userService.createUser(userModel);
    response.sendStatus(204);
  }

  @Post('login')
  async login(
    @Request() req,
    @Body() userModel: { loginOrEmail: string; password: string },
    @Res() response: Response,
  ) {
    const user = await this.authService.checkCredentials(
      userModel.loginOrEmail,
      req.body.password,
      userModel.loginOrEmail,
    );
    if (user && req.headers['user-agent']) {
      const token = this.authService.generateTokens(user);
      await this.authService.saveToken(user.id, token.refreshToken, req.ip);
      response.cookie('refreshToken', token.refreshToken, {
        secure: true,
        httpOnly: true,
      });
      response.status(200).json({ accessToken: token.accessToken });
    } else {
      response.sendStatus(401);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
