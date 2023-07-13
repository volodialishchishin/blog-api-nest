import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments, Length, IsNotEmpty
} from "class-validator";
import { BlogsService } from "../../App/Blog/blogs.service";
import { Injectable } from "@nestjs/common";
import { Transform, TransformFnParams } from "class-transformer";



@ValidatorConstraint({ async: true })
@Injectable()
export class isBlogExists implements ValidatorConstraintInterface {
  constructor(    private readonly blogService: BlogsService,
  ) {
  }
  validate(blogId: any, args: ValidationArguments) {
    return this.blogService.getBlog(blogId).then(blog => {
      return !!blog;
    });
  }
}

export function isBlogIdValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: isBlogExists,
    });
  };
}

export class PostInputModel {
  @Length(1, 30)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;
  @Length(1, 100)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;
  @Length(1, 1000)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content: string;

  @IsNotEmpty()
  @isBlogIdValid({
    message: 'Text must be longer than the title',
  })
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
