
import { IsNotEmpty, Length } from 'class-validator';
import { Transform, TransformFnParams } from "class-transformer";

;

export class CommentInputModel {
  @Length(20, 300)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty()
  content: string;
}
