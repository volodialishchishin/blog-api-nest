import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { json, Request, Response } from 'express';
import { QuestionInputModel } from '../../DTO/Question/question-input-model';
import { QuestionsRepository } from './questions.repository';
import { QuestionsService } from './questions.service';
@Controller('/sa/quiz')
export class QuestionsControllerSa {
  constructor(private questionService: QuestionsService) {}
  @Post('/questions')
  async createQuestion(
    @Res() response: Response,
    @Req() request: Request,
    @Body() question: QuestionInputModel,
  ) {
    const { body, correctAnswers } = question;
    const result = await this.questionService.createQuestion(
      body,
      correctAnswers,
    );
    response.json(result);
  }
}
