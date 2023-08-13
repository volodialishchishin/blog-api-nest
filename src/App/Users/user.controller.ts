import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { Request, Response } from 'express';
import { UserQueryRepository } from '../Query/user.query.repository';
import { BasicAuthGuard } from '../Auth/Guards/basic.auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { BanInputModelDto } from '../../DTO/User/ban-input-model.dto';
@SkipThrottle()
@Controller('/sa/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRep: UserQueryRepository,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchLoginTerm') searchLoginTerm,
    @Query('searchEmailTerm') searchEmailTerm,
    @Query('banStatus') banStatus,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    console.log(banStatus);
    const users = await this.userQueryRep.getUsers(
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      banStatus,
    );
    response.json(users);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() createUserDto: UserInputModel) {
    return this.userService.createUser(createUserDto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  async deleteUser(@Param() params, @Res() response: Response) {
    const result = await this.userService.deleteUser(params.id);
    console.log(result);
    if (result) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }

  @Put('/:id/ban')
  @UseGuards(BasicAuthGuard)
  async banUser(
    @Param() params,
    @Res() response: Response,
    @Body() banInputModel: BanInputModelDto,
  ) {
    if (banInputModel.isBanned) {
      const banUserStatus = await this.userService.banUser(
        params.id,
        banInputModel.banReason,
      );
      banUserStatus ? response.sendStatus(204) : response.sendStatus(404);
      return;
    } else {
      const banUserStatus = await this.userService.unbanUser(params.id);
      banUserStatus ? response.sendStatus(204) : response.sendStatus(404);
      return;
    }
  }
}
