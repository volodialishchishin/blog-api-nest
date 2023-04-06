import { LikeInfoViewModelValues } from './like-info-view-model';
import { Types } from 'mongoose';

export class LikeInfoModel {
  id: Types.ObjectId;
  entetyId: string;
  userId: string;
  status: LikeInfoViewModelValues;
  dateAdded: Date;
  userLogin: string;
}
