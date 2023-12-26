import { IsNotEmpty } from 'class-validator';

export class QuestionInputModel {
  @IsNotEmpty()
  body: string;
  @IsNotEmpty()
  correctAnswers: Array<string>;
}
