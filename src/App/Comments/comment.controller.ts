import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':id')
  async getComment(@Param() params, @Res() response: Response) {
    const comment = await this.commentService.getComment(params.id);
    response.json(comment);
  }
}
