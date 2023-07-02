import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query, Req,
  Res, UseGuards
} from "@nestjs/common";
import { request, Request, Response } from "express";
import { PostQueryRepository } from "../../Query/post.query.repository";
import { PostInputModel } from "../../DTO/Post/post-input-model";
import { BlogsService } from "../Blog/blogs.service";
import { PostService } from "./posts.service";
import { JwtAuthGuard } from "../Auth/Guards/jwt.auth.guard";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";
import { CommentService } from "../Comments/comment.service";
import { AuthService } from "../Auth/auth.service";
import { CommentQueryRepository } from "../../Query/comment.query.repository";

@Controller("posts")
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly blogService: BlogsService,
    private readonly postQueryRep: PostQueryRepository,
    private readonly commentService: CommentService,
    private readonly authService: AuthService,
    private readonly commentsQueryRep: CommentQueryRepository
  ) {
  }

  @Get()
  async getPosts(
    @Query("sortBy") sortBy,
    @Query("sortDirection") sortDirection,
    @Query("pageNumber") pageNumber,
    @Query("pageSize") pageSize,
    @Query("searchNameTerm") searchNameTerm,
    @Res() response: Response
  ) {
    const blogs = await this.postQueryRep.getPosts(
      pageNumber,
      sortBy,
      pageSize,
      sortDirection
    );
    response.json(blogs);
  }
  @UseGuards(JwtAuthGuard)

  @Post()
  async createPost(
    @Body() createPostDto: PostInputModel,
    @Res() response: Response
  ) {
    const blog = await this.blogService.getBlog(createPostDto.blogId);
    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const result = await this.postService.createPost(
      createPostDto.blogId,
      createPostDto.title,
      createPostDto.content,
      createPostDto.shortDescription,
      blog.name
    );
    response.json(result);
  }
  @UseGuards(JwtAuthGuard)

  @Put(":id")
  async updatePost(
    @Param() params,
    @Body() updatePostDTO: PostInputModel,
    @Res() response: Response
  ) {
    const blog = await this.blogService.getBlog(updatePostDTO.blogId);
    if (!blog) {
      response.sendStatus(404);
      return;
    }
    const result = await this.postService.updatePost(
      updatePostDTO.blogId,
      updatePostDTO.title,
      updatePostDTO.content,
      updatePostDTO.shortDescription,
      params.id
    );
    if (result) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }
  @UseGuards(JwtAuthGuard)

  @Delete(":id")
  async deletePost(@Param() params, @Res() response: Response) {
    const deleteResult = await this.postService.deletePost(params.id);
    if (deleteResult) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  }

  @Get("/:id")
  async getPostById(@Param() params, @Res() response: Response, @Req() request: Request) {
    const authToken = request.headers.authorization?.split(' ')[1] || ''
    const user = this.authService.getUserIdByToken(authToken)
    const post = await this.postService.getPost(params.id, user?.user);
    if (post) {
      response.json(post);
    } else {
      response.sendStatus(404);
    }
  }

  @UseGuards(JwtAuthGuard)

  @Get("/:id/comments")
  async getCommentsForPost(@Req() request: Request, @Param() params, @Body() createCommentDto: {
    content: string
  }, @Res() response: Response) {

    const { content } = createCommentDto;
    const { context: { user } } = request;
    let foundPost = await this.postService.getPost(params.id, user.userId);
    if (!foundPost) {
      response.sendStatus(404);
    } else {
      let result = await this.commentService.createComment(params.id, content, user.userId, user.login);

      let comment = await this.commentService.getComment(result.id, user.userId);
      comment!.likesInfo = {
        myStatus: LikeInfoViewModelValues.none,
        dislikesCount: 0,
        likesCount: 0
      };
      response.status(201).json(comment);
    }

  }
  @UseGuards(JwtAuthGuard)

  @Post("/:id/comments")

  async createCommentForPost(
    @Query("sortBy") sortBy,
    @Query("sortDirection") sortDirection,
    @Query("pageNumber") pageNumber,
    @Query("pageSize") pageSize,
    @Query("searchNameTerm") searchNameTerm,
    @Param() params, @Res() response: Response, @Req() request) {
    try {
      const authToken = request.headers.authorization?.split(" ")[1] || "";
      const user = this.authService.getUserIdByToken(authToken);
      let result = await this.commentsQueryRep.getComments(params.id, pageNumber, sortBy, pageSize, sortDirection, user?.user);
      result.items.length ? response.status(200).json(result) : response.sendStatus(404);
    } catch (e) {
      console.log(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put("/:postId/like-status")
  async updatePostLikeStatus(@Param() params, @Req() request: Request, @Res() response: Response,  @Body() createCommentDto: {
    likeStatus: LikeInfoViewModelValues
  }) {
    const { likeStatus } = createCommentDto

    let result = await this.postService.updateLikeStatus(likeStatus, request.context.user.userId, params.postId, request.context.user.login)
    if (result){
      response.sendStatus(204)
    }else{
      response.sendStatus(404)
    }
  }
}
