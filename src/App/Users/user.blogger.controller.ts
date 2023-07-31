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
import {
  BanInputModelDto,
  BanUserForBlogInputModelDto,
} from '../../DTO/User/ban-input-model.dto';
import { JwtAuthGuard } from "../Auth/Guards/jwt.auth.guard";
@SkipThrottle()
@Controller('/blogger/users')
export class UserBloggerController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRep: UserQueryRepository,
  ) {}

  @Get('blog/:blogId')
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchLoginTerm') searchLoginTerm,
    @Query('searchEmailTerm') searchEmailTerm,
    @Query('banStatus') banStatus,
    @Param() params,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    console.log('12313');
    const users = await this.userQueryRep.getBannedUsersForBlog(
      searchLoginTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      params.blogId
    );
    users.items.length? response.json(users):response.sendStatus(404)
  }

  @Put('/:id/ban')
  @UseGuards(JwtAuthGuard)
  async banUser(
    @Param() params,
    @Res() response: Response,
    @Body() banInputModel: BanUserForBlogInputModelDto,
  ) {
    console.log(banInputModel.isBanned,banInputModel.blogId,params.id );
    if (banInputModel.isBanned) {
      console.log('3123');
      let banUserStatus = await this.userService.banUserForBlog(
        params.id,
        banInputModel.blogId,
        banInputModel.banReason,
      );
      banUserStatus ? response.sendStatus(204) : response.sendStatus(404);
      return;
    } else {
      let banUserStatus = await this.userService.unbanUserForBlog(
        params.id,
        banInputModel.blogId,
      );
      banUserStatus ? response.sendStatus(204) : response.sendStatus(404);
      return;
    }
  }
}
