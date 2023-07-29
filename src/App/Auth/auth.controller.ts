import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly authRep: AuthRepository,
    private readonly mailService: MailService,
  ) {}
  @UseGuards(ThrottlerGuard)
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

  @UseGuards(ThrottlerGuard)
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
      let deviceId = v4();
      const token = this.authService.generateTokens(user, deviceId);
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
  @UseGuards(ThrottlerGuard)
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

  @UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  async registrationConfirmation(
    @Request() req,
    @Body() userModel: { code: string },
    @Res() response: Response,
  ) {
    const user = await this.userService.getUserByField(userModel.code);
    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      !user.emailConfirmation?.confirmationCode
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
  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  async newPassword(
    @Request() req,
    @Body() recoveryInfo: { newPassword: string; recoveryCode: string },
    @Res() response: Response,
  ) {
    const { newPassword, recoveryCode } = req.body;
    const user = await this.authService.getUserByRecoveryCode(recoveryCode);
    if (user) {
      let updateStatus = this.authService.processPasswordRecovery(
        newPassword,
        user.id.toString(),
      );
      if (updateStatus) {
        response.sendStatus(204);
      } else {
        response.sendStatus(400);
      }
    } else {
      throw new BadRequestException([
        {
          message: 'incorrect recovery code',
          field: 'recoveryCode',
        },
      ]);
    }
  }
  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  async passwordRecovery(
    @Request() req,
    @Body() recoveryInfo: { email: string },
    @Res() response: Response,
  ) {
    const { email } = req.body;
    try {
      const user = await this.userService.getUserByLoginOrEmail('', email);
      let code = v4();
      await this.mailService.sendRecoveryPasswordCode(user.result, false, code);
      await this.authService.savePasswordRecoveryCode(user.result.id, code);
      response.sendStatus(204);
    } catch (e) {
      response.sendStatus(204);
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req, @Res() response: Response) {
    try {
      const { refreshToken } = req.cookies;
      let tokens;
      if (req.headers['user-agent']) {
        tokens = await this.authService.refresh(
          refreshToken,
          req.headers['user-agent'],
          req.ip,
        );
      }
      if (tokens) {
        response.cookie('refreshToken', tokens.refreshToken, {
          secure: true,
          httpOnly: true,
        });
        return response.status(200).json({ accessToken: tokens.accessToken });
      }
    } catch (e) {
      response.sendStatus(401);
    }
  }
  @UseGuards(ThrottlerGuard)
  @Post('logout')
  async logout(
    @Req() req,
    @Body() recoveryInfo: { email: string },
    @Res() response: Response,
  ) {
    try {
      const { refreshToken } = req.cookies;
      await this.authService.logout(refreshToken);
      response.clearCookie('refreshToken');
      response.sendStatus(204);
    } catch (e) {
      response.sendStatus(401);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request) {
    return request.user.userInfo;
  }
}
