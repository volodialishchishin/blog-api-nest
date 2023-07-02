import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CommentatorInfo, LikesInfoSchema } from './comment.schema';

export type UserDocument = HydratedDocument<User>;
@Schema()
export class AccountData {
  @Prop({ isRequired: true })
  login: string;
  @Prop({ isRequired: true })
  email: string;
  @Prop({ isRequired: true })
  createdAt: string;
  @Prop({ isRequired: true })
  password: string;
  @Prop({ isRequired: true })
  passwordSalt: string;
}
export const accountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema()
export class EmailConfirmation {
  @Prop()
  confirmationCode: string;
  @Prop()
  confirmationDate: Date;
  @Prop()
  isConfirmed: boolean;
}

export const emailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
@Schema()
export class User {
  @Prop({ type: accountDataSchema })
  accountData: AccountData;
  @Prop({ type: emailConfirmationSchema })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);
