import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({ isRequired: true })
  name: string;

  @Prop({ isRequired: true })
  description: string;

  @Prop({ isRequired: true })
  websiteUrl: string;

  @Prop({ isRequired: true })
  createdAt: string;

  @Prop({ isRequired: true })
  isMembership: boolean;

  @Prop()
  userId: string;

  @Prop({ isRequired: true })
  userLogin: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
