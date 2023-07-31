import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Blog } from './blog.schema';

export type BannedUsersForBlogDocument = HydratedDocument<BannedUsersForBlog>;

@Schema()
export class BannedUsersForBlog {
  @Prop({ isRequired: true })
  userId: string;

  @Prop({ isRequired: true })
  blogId: string;

  @Prop({ isRequired: true })
  banReason: string;

  @Prop({ isRequired: true })
  userLogin: string;

  @Prop({ isRequired: true })
  banDate: string;

  @Prop({ isRequired: true })
  isBanned: boolean;
}

export const BannedUsersForBlogSchema =
  SchemaFactory.createForClass(BannedUsersForBlog);
