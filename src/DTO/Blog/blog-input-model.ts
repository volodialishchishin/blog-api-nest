import { IsNotEmpty, Length, Matches } from 'class-validator';

export class BlogInputModel {
  @Length(1, 15)
  @IsNotEmpty()
  name: string;

  @Length(1, 500)
  @IsNotEmpty()
  description: string;

  @Length(1, 100)
  @IsNotEmpty()
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
