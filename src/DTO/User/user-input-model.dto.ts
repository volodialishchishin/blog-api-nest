import { IsNotEmpty, Length, Matches} from 'class-validator';

export class CreateUserDto {
    @Length(3,10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    login: string;

    @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    email: string;

    @Length(6,20)
    password: string;
}
