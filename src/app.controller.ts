import {
  Controller,
  Delete,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller('/testing/all-data')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Delete()
  deleteAll(@Res() res: Response) {
    this.appService.deleteAll();
    res.sendStatus(204);
  }
}
