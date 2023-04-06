import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema()
export class Like {
  @Prop()
  addedAt: string;

  @Prop()
  userId: string;

  @Prop()
  login: string;
}
export const LikeSchema = SchemaFactory.createForClass(Like);
