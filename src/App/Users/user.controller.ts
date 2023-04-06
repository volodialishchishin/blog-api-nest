import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserInputModel } from '../../DTO/User/user-input-model.dto';
import { Request, Response } from 'express';
import { UserQueryRepository } from '../../Query/user.query.repository';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryRep: UserQueryRepository,
  ) {}

  @Get()
  async getUsers(
    @Query('sortBy') sortBy,
    @Query('sortDirection') sortDirection,
    @Query('pageNumber') pageNumber,
    @Query('pageSize') pageSize,
    @Query('searchLoginTerm') searchLoginTerm,
    @Query('searchEmailTerm') searchEmailTerm,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const users = await this.userQueryRep.getUsers(
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      sortBy,
      pageSize,
      sortDirection,
    );
    response.json(users);
  }

  @Post()
  async createUser(@Body() createUserDto: UserInputModel) {
    return this.userService.createUser(createUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param() params,@Res() response: Response,) {
    let result =  await this.userService.deleteUser(params.id);
    if (result)
    {
      response.sendStatus(204)
    }
    else{
      response.sendStatus(404)
    }
  }
}
