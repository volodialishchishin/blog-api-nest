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
import { v4 } from 'uuid';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { UserService } from '../Users/user.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { MailService } from './Mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly authRep: AuthRepository,
    private readonly mailService: MailService,
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
    if (isUserExists.result) {
      throw new BadRequestException([
        {
          message: 'User Exists',
          field: isUserExists.field,
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

  @Post('registration-email-resending')
  async registrationEmailResending(
    @Request() req,
    @Body() userModel: { email: string },
    @Res() response: Response,
  ) {
    const user = await this.userService.getUserByLoginOrEmail(
      '',
      userModel.email,
    );
    if (user?.result?.emailConfirmation?.isConfirmed || !user.result) {
      throw new BadRequestException([
        {
          message: 'User is already confirmed',
          field: 'email',
        },
      ]);
    }
    const newCode = v4();
    await this.userService.updateUser(
      user.result.id,
      'emailConfirmation.confirmationCode',
      newCode,
    );
    await this.mailService.sendMailConfirmation(user.result, true, newCode);
    response.sendStatus(204);
  }

  @Post('registration-confirmation')
  async registrationConfirmation(
    @Request() req,
    @Body() userModel: { code: string },
    @Res() response: Response,
  ) {
    const user = await this.userService.getUserByField(
      userModel.code,
    );
    if (
      !user || user.emailConfirmation.isConfirmed || !user.emailConfirmation?.confirmationCode
    ) {
      throw new BadRequestException([
        {
          message: 'User Alredy Exists',
          field: 'code',
        },
      ]);
    }

    const status = await this.userService.confirmCode(user, userModel.code);
    if (status) {
      response.sendStatus(204);
    } else response.sendStatus(400);
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
