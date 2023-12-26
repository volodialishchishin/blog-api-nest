import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
@Controller()
export class QuestionsController {
  @Post()
  async createQuestion(@Res() response: Response, @Req() request: Request) {}
}
