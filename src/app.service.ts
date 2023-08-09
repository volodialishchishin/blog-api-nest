import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository';

@Injectable()
export class AppService {
  constructor(private appRep: AppRepository) {}

  async deleteAll() {
    return await this.appRep.deleteAll();
  }
}
