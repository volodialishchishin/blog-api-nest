import { LikeInfoViewModelValues } from './like-info-view-model';
import { Types } from 'mongoose';

export class LikeInfoModel {
  entityId: string;
  userId: string;
  status: LikeInfoViewModelValues;
  dateAdded: Date;
  userLogin: string;
}
