import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BlogQueryRepository } from '../Query/blog.query.repository';
import { BlogInputModel } from '../../DTO/Blog/blog-input-model';
import { BlogsService } from './blogs.service';
import { PostService } from '../Post/posts.service';
import {
  BlogPostInputModel,
  PostInputModel,
} from '../../DTO/Post/post-input-model';
import { JwtAuthGuard } from '../Auth/Guards/jwt.auth.guard';
import { BasicAuthGuard } from '../Auth/Guards/basic.auth.guard';
import { AuthService } from '../Auth/auth.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('sa/blogs')
export class BlogSaController {
  constructor(
    private readonly blogQueryRep: BlogQueryRepository,
    private readonly blogService: BlogsService
  ) {}
  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlog(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchNameTerm') searchNameTerm,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blogs = await this.blogQueryRep.getBlogsSa(
      searchNameTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
    );
    response.json(blogs);
  }
  @Put('/:blogId/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
  async bindBlog(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    let blogBindUpdateStatus = this.blogService.bindBlog(
      params.blogId,
      params.userId,
    );
    if (blogBindUpdateStatus) response.sendStatus(204);
    response.sendStatus(400);
  }

  @Put('/:blogId')
  @UseGuards(BasicAuthGuard)
  async banBlog(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
    @Body() banInputModel: {isBanned:boolean},
  ) {
    if (banInputModel.isBanned) {
      let banUserStatus = await this.blogService.banBlog(
        params.blogId
      );
      banUserStatus ? response.sendStatus(204) : response.sendStatus(404);
      return;
    } else {
      let banUserStatus = await this.blogService.unbanBlog(params.blogId);
      banUserStatus ? response.sendStatus(204) : response.sendStatus(404);
      return;
    }
  }
}
