
import { IsNotEmpty, Length } from 'class-validator';;

export class CommentInputModel {
  @Length(10, 3000)
  @IsNotEmpty()
  content: string;
}
