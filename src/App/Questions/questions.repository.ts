import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionViewModel } from '../../DTO/Question/question-view-model';
import { QuestionEntity } from '../../DB/Entities/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    private questionRep: Repository<QuestionEntity>,
  ) {}

  async createQuestion(question): Promise<QuestionViewModel> {
    const result = await this.questionRep.save(question);
    return result;
  }
}
