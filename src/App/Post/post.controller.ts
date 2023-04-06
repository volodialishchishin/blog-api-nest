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
} from '@nestjs/common';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { Request, Response } from 'express';
import { UserQueryRepository } from '../../Query/user.query.repository';
import { UserService } from '../Users/user.service';
import { PostQueryRepository } from '../../Query/post.query.repository';
import { PostInputModel } from '../../DTO/Post/post-input-model';
import { BlogInputModel } from '../../DTO/Blog/blog-input-model';
import {BlogsService} from "../Blog/blogs.service";
import {PostService} from "./posts.service";

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly blogService: BlogsService,
    private readonly postQueryRep: PostQueryRepository,
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
    const blogs = await this.postQueryRep.getPosts(
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
    );
    response.json(blogs);
  }

  @Post()
  async createPost(@Body() createPostDto: PostInputModel,@Res() response: Response,) {
    let blog = await this.blogService.getBlog(createPostDto.blogId)
    console.log(this.postQueryRep)
    if (!blog){
      response.sendStatus(404)
      return
    }
    let result = await this.postService.createPost(
      createPostDto.blogId,
      createPostDto.title,
      createPostDto.content,
      createPostDto.shortDescription,
      blog.name
    );
    response.json(result)
  }

  @Put(':id')
  async updatePost(@Param() params, @Body() updatePostDTO: PostInputModel,@Res() response: Response) {

    let blog = await this.blogService.getBlog(updatePostDTO.blogId)
    if (!blog){
      response.sendStatus(404)
      return
    }
    let result =  this.postService.updatePost(
      updatePostDTO.blogId,
      updatePostDTO.title,
      updatePostDTO.content,
      updatePostDTO.shortDescription,
      params.id,
    );
    if (result){
      response.sendStatus(204)
    }
    else{
      response.sendStatus(404)
    }
  }

  @Delete(':id')
  async deletePost(@Param() params, @Res() response: Response) {
    let deleteResult = await this.postService.deletePost(params.id);
    if (deleteResult){
      response.sendStatus(204)
    }else{
      response.sendStatus(404)
    }
  }

  @Get('/:id')
  async getPostById(@Param() params, @Res() response: Response) {
    const post = await this.postService.getPost(params.id);
    if (post){
      response.json(post);
    }
    else{
      response.sendStatus(404)

    }
  }
}
