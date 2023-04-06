import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LikeType } from '../Types/Like/like.type';
import { Like, LikeSchema } from './like.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class ExtendedLikesInfo {
  @Prop()
  likesCount: number;

  @Prop()
  dislikesCount: number;

  @Prop()
  myStatus: LikeType;

  @Prop({ type: [LikeSchema] })
  newestLikes: Array<Like>;
}
export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post {
  @Prop({ isRequired: true })
  title: string;

  @Prop({ isRequired: true })
  shortDescription: string;

  @Prop({ isRequired: true })
  content: string;

  @Prop({ isRequired: true })
  blogId: string;

  @Prop({ isRequired: true })
  blogName: string;

  @Prop({ isRequired: true })
  createdAt: string;

  @Prop({ type: ExtendedLikesInfoSchema })
  extendedLikesInfo: ExtendedLikesInfo;
}

export const PostSchema = SchemaFactory.createForClass(Post);
