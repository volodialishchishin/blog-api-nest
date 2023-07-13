import { IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform, TransformFnParams } from "class-transformer";

export class BlogInputModel {
  @Length(1, 15)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @Length(1, 500)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;

  @Length(1, 100)
  @IsNotEmpty()
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
