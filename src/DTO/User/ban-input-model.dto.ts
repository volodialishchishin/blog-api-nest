import { IsNotEmpty, Length, Matches } from 'class-validator';

export class BanInputModelDto {
  @Length(20)
  @IsNotEmpty()
  banReason: string;

  @IsNotEmpty()
  isBanned: boolean;
}
export class BanUserForBlogInputModelDto {
  @Length(20)
  @IsNotEmpty()
  banReason: string;

  @IsNotEmpty()
  isBanned: boolean;

  @IsNotEmpty()
  blogId: string;
}
