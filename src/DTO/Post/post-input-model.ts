import { IsNotEmpty, Length } from 'class-validator';

export class PostInputModel {
  @Length(1, 30)
  @IsNotEmpty()
  title: string;
  @Length(1, 100)
  @IsNotEmpty()
  shortDescription: string;
  @Length(1, 1000)
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  blogId: string;
}
export class BlogPostInputModel {
  @Length(1, 30)
  @IsNotEmpty()
  title: string;
  @Length(1, 100)
  @IsNotEmpty()
  shortDescription: string;
  @Length(1, 1000)
  @IsNotEmpty()
  content: string;
}
