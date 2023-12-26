import { Injectable } from '@nestjs/common';
import { QuestionViewModel } from '../../DTO/Question/question-view-model';
import { QuestionsRepository } from './questions.repository';

@Injectable()
export class QuestionsService {
  constructor(private questionRep: QuestionsRepository) {}

  async createQuestion(body, correctAnswers): Promise<QuestionViewModel> {
    const question = {
      body,
      correctAnswers,
      published: false,
    };

    const result = await this.questionRep.createQuestion(question);
    return result;
  }
}
