import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeType } from '../@types/Like/like.type';
import { LikeSchema } from './like.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class CommentatorInfo {
  @Prop()
  userId: string;

  @Prop()
  userLogin: string;
}
export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class LikesInfo {
  @Prop()
  likesCount: number;

  @Prop()
  dislikesCount: number;

  @Prop()
  myStatus: LikeType;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema()
export class Comment {
  @Prop({ isRequired: true }) userLogin: string;
  @Prop({ isRequired: true }) content: string;
  @Prop({ isRequired: true }) userId: string;
  @Prop({ isRequired: true }) createdAt: string;
  @Prop({ isRequired: true }) postId: string;
  @Prop({ isRequired: true }) isUserBanned: boolean;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
