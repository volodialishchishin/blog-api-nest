import {
    Body,
    Controller,
    Delete,
    Get, HttpException, HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res,
} from '@nestjs/common';
import {Response} from 'express';
import {BlogQueryRepository} from '../../Query/blog.query.repository';
import {BlogInputModel} from '../../DTO/Blog/blog-input-model';
import {BlogsService} from './blogs.service';
import {PostService} from "../Post/posts.service";
import {BlogPostInputModel} from "../../DTO/Post/post-input-model";

@Controller('blogs')
export class BlogController {
    constructor(
        private readonly blogQueryRep: BlogQueryRepository,
        private readonly blogService: BlogsService,
        private readonly postService: PostService,
    ) {
    }

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
    ) {
        let blog = this.blogService.getBlog(params.blogId)
        if (!blog){
            response.sendStatus(404)
            return
        }
        const posts = await this.blogQueryRep.getPostsRelatedToBlog(
            pageNumber,
            sortBy,
            pageSize,
            sortDirection,
            params.blogId,
        );
        response.json(posts);
    }

    @Get(':id')
    async getBlogById(@Param() params, @Res() response: Response) {
        const blog = await this.blogService.getBlog(params.id);
        if (blog){
            response.json(blog)
        }
        else{
            response.sendStatus(404)
        }
    }

    @Post()
    async createBlog(@Body() createBlogDto: BlogInputModel) {
        return this.blogService.createBlog(createBlogDto);
    }

    @Post('/:blogId/posts')
    async createPostToBlog(
        @Param() params,
        @Res() response: Response,
        @Body() createPostDto: BlogPostInputModel
    ) {
        let blog = await this.blogService.getBlog(params.blogId)
        if (!blog){
            response.sendStatus(404)
            return
        }
        const post = await this.postService.createPost(
            params.blogId,
            createPostDto.title,
            createPostDto.content,
            createPostDto.shortDescription,
            blog.name
        );
    }

    @Put(':id')
    async updateBlog(@Param() params, @Body() createBlogDto: BlogInputModel,@Res() response: Response,) {
        let blog = this.blogService.getBlog(params.blogId)
        if (!blog){
            response.sendStatus(404)
            return
        }

        let updateResult  = await this.blogService.updateBlog(
            createBlogDto.name,
            createBlogDto.websiteUrl,
            createBlogDto.description,
            params.id,
        );
        response.sendStatus(204)

    }

    @Delete(':id')
    async deleteBlog(@Param() params,@Res() response: Response,) {
        let blog = await this.blogService.getBlog(params.id)
        if (!blog){
            response.sendStatus(404)
            return
        }
        response.sendStatus(204)
        return this.blogService.deleteBlog(params.id);
    }
}
