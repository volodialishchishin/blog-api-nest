import {
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
import { request, Request, Response } from 'express';
import { PostQueryRepository } from '../Query/post.query.repository';
import { PostInputModel } from '../../DTO/Post/post-input-model';
import { BlogsService } from '../Blog/blogs.service';
import { PostService } from './posts.service';
import { JwtAuthGuard } from '../Auth/Guards/jwt.auth.guard';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { CommentService } from '../Comments/comment.service';
import { AuthService } from '../Auth/auth.service';
import { CommentQueryRepository } from '../Query/comment.query.repository';
import { BasicAuthGuard } from '../Auth/Guards/basic.auth.guard';
import { CommentInputModel } from '../../DTO/Comment/comment-input-model';
import { LikeInputModel } from '../../DTO/LikeInfo/like-input-model';
import { SkipThrottle } from '@nestjs/throttler';
@SkipThrottle()
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly blogService: BlogsService,
    private readonly postQueryRep: PostQueryRepository,
    private readonly commentService: CommentService,
    private readonly authService: AuthService,
    private readonly commentsQueryRep: CommentQueryRepository,
  ) {}

  @Get()
  async getPosts(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchNameTerm') searchNameTerm,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const authToken = request?.headers?.authorization?.split(' ')[1] || '';
    const user = await this.authService.getUserIdByToken(authToken);
    const posts = await this.postQueryRep.getPosts(
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
      user?.user,
    );
    response.json(posts);
  }

  @Get(':id')
  async getPostById(
    @Param() params,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    console.log('312');
    const authToken = request.headers.authorization?.split(' ')[1] || '';
    const user = await this.authService.getUserIdByToken(authToken);
    const post = await this.postService.getPost(params.id, user?.user);
    if (post) {
      response.json(post);
    } else {
      response.sendStatus(404);
    }
  }

  @Post('/:id/comments')
  @UseGuards(JwtAuthGuard)
  async getCommentsForPost(
    @Req() request: Request,
    @Param() params,
    @Body() createCommentDto: CommentInputModel,
    @Res() response: Response,
  ) {
    const { content } = createCommentDto;
    const { userInfo } = request.user;
    let foundPost = await this.postService.getPost(params.id, userInfo.userId);
    if (!foundPost) {
      response.sendStatus(404);
    } else {
      let result = await this.commentService.createComment(
        params.id,
        content,
        userInfo.userId,
        userInfo.login,
      );

      result ? response.status(201).json(result) : response.sendStatus(404);
    }
  }

  @Get('/:postId/comments')
  async getComments(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchNameTerm') searchNameTerm,
    @Param() params,
    @Res() response: Response,
    @Req() request,
  ) {
    try {
      const authToken = request.headers.authorization?.split(' ')[1] || '';
      const user = await this.authService.getUserIdByToken(authToken);
      let result = await this.commentsQueryRep.getComments(
        pageNumber,
        sortBy,
        pageSize,
        sortDirection,
        params.postId,
        user?.user,
      );
      result.items.length
        ? response.status(200).json(result)
        : response.sendStatus(404);
    } catch (e) {}
  }

  @Put('/:postId/like-status')
  @UseGuards(JwtAuthGuard)
  async updatePostLikeStatus(
    @Param() params,
    @Req() request: Request,
    @Res() response: Response,
    @Body() likeInputModel: LikeInputModel,
  ) {
    let result = await this.postService.updateLikeStatus(
      likeInputModel.likeStatus,
      request.user.userInfo.userId,
      params.postId,
      request.user.userInfo.login,
    );
    if (result) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }
}
