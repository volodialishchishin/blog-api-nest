import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../Schemas/blog.schema';
import { Model } from 'mongoose';
import { BlogsService } from '../App/Blog/blogs.service';

@Injectable()
export class blogExisting implements NestMiddleware {
  constructor(private readonly blogService: BlogsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const blog = await this.blogService.getBlog(req.params.blogId);
    if (!blog) {
      throw new BadRequestException([
        {
          message: 'This blog does not exists',
          field: 'blogId',
        },
      ]);
    }
    next();
  }
}
