import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository';

@Injectable()
export class AppService {
  constructor(private appRep: AppRepository) {}

  deleteAll() {
    return this.appRep.deleteAll();
  }
}
