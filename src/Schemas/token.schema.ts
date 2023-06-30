import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeType } from '../Types/Like/like.type';

export type TokenDocument = HydratedDocument<Token>;

@Schema()
export class Token {
  @Prop()
  userId: string;
  @Prop()
  refreshToken: string;
  @Prop()
  ip: string;
  @Prop()
  title: string;
  @Prop()
  lastActiveDate: string;
  @Prop()
  deviceId: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
