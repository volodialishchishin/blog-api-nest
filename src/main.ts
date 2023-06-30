import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./Filters/exception.filter";
import e from "express";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe(
    {
      stopAtFirstError:true,
      exceptionFactory:(errors)=>{
        let errorsForResponse = []
        errors.forEach((error)=>{
          const constraintsKeys = Object.keys(error.constraints)
          constraintsKeys.forEach((constraintsKey)=>{
            errorsForResponse.push({
              message: error.constraints[constraintsKey],
              field: error.property
            })
          })
        })
        throw new BadRequestException(errorsForResponse)
      }
    }
  ));
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(PORT);
}
bootstrap();
