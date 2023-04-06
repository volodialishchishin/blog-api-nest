import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeType } from '../Types/Like/like.type';

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
export class likesInfo {
  @Prop()
  likesCount: number;

  @Prop()
  dislikesCount: number;

  @Prop()
  myStatus: LikeType;
}

export const LikesInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

export class Comment {
  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop()
  content: string;

  @Prop()
  createdAt: string;

  @Prop({ type: LikesInfoSchema })
  likesInfo: likesInfo;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
