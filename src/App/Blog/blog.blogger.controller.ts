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
  updateInputModel,
} from '../../DTO/Post/post-input-model';
import { JwtAuthGuard } from '../Auth/Guards/jwt.auth.guard';
import { BasicAuthGuard } from '../Auth/Guards/basic.auth.guard';
import { AuthService } from '../Auth/auth.service';
import { SkipThrottle } from '@nestjs/throttler';
import { CommentQueryRepository } from '../Query/comment.query.repository';

@SkipThrottle()
@Controller('blogger/blogs')
export class BlogBloggerController {
  constructor(
    private readonly blogQueryRep: BlogQueryRepository,
    private readonly commentQueryRep: CommentQueryRepository,
    private readonly blogService: BlogsService,
    private readonly postService: PostService,
    private readonly authService: AuthService,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body() createBlogDto: BlogInputModel,
    @Req() request: Request,
  ) {
    return this.blogService.createBlog(createBlogDto, request.user.userInfo);
  }

  @Post('/:blogId/posts')
  @UseGuards(JwtAuthGuard)
  async createPostToBlog(
    @Param() params,
    @Res() response: Response,
    @Body() createPostDto: BlogPostInputModel,
    @Req() request: Request,
  ) {
    const blog = await this.blogService.getBlog(params.blogId);

    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.blogId,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);
    const post = await this.postService.createPost(
      params.blogId,
      createPostDto.title,
      createPostDto.content,
      createPostDto.shortDescription,
      blog.name,
      request.user.userInfo.userId,
    );
    response.json(post);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @Param() params,
    @Body() createBlogDto: BlogInputModel,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blog = await this.blogService.getBlog(params.id);
    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.id,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);
    const updateResult = await this.blogService.updateBlog(
      createBlogDto.name,
      createBlogDto.websiteUrl,
      createBlogDto.description,
      params.id,
    );
    if (updateResult) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlog(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blog = await this.blogService.getBlog(params.id);
    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.id,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);

    response.sendStatus(204);
    return this.blogService.deleteBlog(params.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBlogs(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchNameTerm') searchNameTerm,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blogs = await this.blogQueryRep.getBlogsRelatedToUser(
      searchNameTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      request.user.userInfo.userId,
    );
    response.json(blogs);
  }

  @Get('/:blogId/posts')
  @UseGuards(JwtAuthGuard)
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

    const userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.blogId,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);

    const posts = await this.blogQueryRep.getPostsRelatedToBlog(
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      params.blogId,
      request.user.userInfo.userId,
    );
    response.json(posts);
  }

  @Put('/:blogId/posts/:postId')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param() params,
    @Body() updatePostDTO: updateInputModel,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blog = await this.blogService.getBlog(params.blogId);
    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.blogId,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);
    const result = await this.postService.updatePost(
      params.blogId,
      updatePostDTO.title,
      updatePostDTO.content,
      updatePostDTO.shortDescription,
      params.postId,
    );
    if (result) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }

  @Delete('/:blogId/posts/:postId')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const blog = await this.blogService.getBlog(params.blogId);
    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const userAccess = await this.blogService.checkIfBlogBelongsToUser(
      params.blogId,
      request.user.userInfo.userId,
    );
    if (!userAccess) response.sendStatus(403);
    const deleteResult = await this.postService.deletePost(params.postId);
    if (deleteResult) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }

  @Get('/comments')
  @UseGuards(JwtAuthGuard)
  async getAllComments(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
  ) {
    console.log('hello');
    const comments = await this.commentQueryRep.getAllCommentsForBlog(
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      request.user.userInfo.userId,
    );
    if (comments.items.length) {
      response.json(comments);
    } else {
      response.sendStatus(404);
    }
  }
}
