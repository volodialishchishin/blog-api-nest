import { IsNotEmpty, Length, Matches } from 'class-validator';

export class UserInputModel {
  @Length(3, 10)
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @IsNotEmpty()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;

  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
