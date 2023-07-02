import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeType } from '../@types/Like/like.type';

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

export const LikesInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

export class Comment {
  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;
  @Prop()
  userLogin:string
  @Prop()
  content: string;
  @Prop()
  userId: string;
  @Prop()
  createdAt: Date;
  @Prop()
  postId: string;

  @Prop({ type: LikesInfoSchema })
  likesInfo: LikesInfo;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
