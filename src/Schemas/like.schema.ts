import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeInfoViewModelValues } from "../DTO/LikeInfo/like-info-view-model";

export type LikeDocument = HydratedDocument<Like>;

@Schema()
export class LikeInfo {
  @Prop()
  addedAt: string;

  @Prop()
  userId: string;

  @Prop()
  login: string;
}
@Schema()
export class Like {
  @Prop()
  entityId:string
  @Prop()
  userId:string
  @Prop()
  status:LikeInfoViewModelValues
  @Prop()
  dateAdded: Date
  @Prop()
  userLogin:string
}

export const LikeSchema = SchemaFactory.createForClass(LikeInfo);
