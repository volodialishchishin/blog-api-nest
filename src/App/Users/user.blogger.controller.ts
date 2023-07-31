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
import { BlogsService } from "../Blog/blogs.service";
@SkipThrottle()
@Controller('/blogger/users')
export class UserBloggerController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRep: UserQueryRepository,
    private readonly blogService: BlogsService,
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
    let userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.blogId,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);
    const users = await this.userQueryRep.getBannedUsersForBlog(
      searchLoginTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      params.blogId
    );
    users.items.length? response.json(users) : response.sendStatus(404)
  }

  @Put('/:id/ban')
  @UseGuards(JwtAuthGuard)
  async banUser(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
    @Body() banInputModel: BanUserForBlogInputModelDto,
  ) {
    let accessToBan = await this.userService.checkIfUserHasAccessToBan(request.user.userInfo.userId, banInputModel.blogId)
    if (!accessToBan) response.sendStatus(403)
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
      await this.userService.unbanUserForBlog(
        params.id,
        banInputModel.blogId,
      );
      response.sendStatus(204)
      return
    }
  }
}
