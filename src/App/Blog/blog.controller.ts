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
import { AuthService } from '../Auth/auth.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogQueryRep: BlogQueryRepository,
    private readonly blogService: BlogsService,
    private readonly postService: PostService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getBlogs(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchNameTerm') searchNameTerm,
    @Res() response: Response,
  ) {
    const blogs = await this.blogQueryRep.getBlogs(
      searchNameTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
    );
    response.json(blogs);
  }

  @Get('/:blogId/posts')
  async getPostsRelatedToBlog(
    @Param() params,
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchNameTerm') searchNameTerm,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blog = await this.blogService.getBlog(params.blogId);
    if (!blog) {
      response.sendStatus(404);
      return;
    }

    const authToken = request?.headers?.authorization?.split(' ')[1] || '';
    const user = await this.authService.getUserIdByToken(authToken);

    const posts = await this.blogQueryRep.getPostsRelatedToBlog(
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      params.blogId,
      user?.user,
    );
    response.json(posts);
  }

  @Get(':id')
  async getBlogById(@Param() params, @Res() response: Response) {
    const blog = await this.blogService.getBlog(params.id);
    if (blog) {
      response.json(blog);
    } else {
      response.sendStatus(404);
    }
  }
}
