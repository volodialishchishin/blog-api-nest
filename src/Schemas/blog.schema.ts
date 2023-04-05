// import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
// import {HydratedDocument} from 'mongoose';
//
// export type UserDocument = HydratedDocument<User>;
//
// @Schema()
// export class AccountData {
//     @Prop({isRequired: true})
//     login:string
//
//     @Prop({isRequired: true})
//     email:string
//
//     @Prop({isRequired: true})
//     createdAt:string
//
//     @Prop({isRequired: true})
//     password:string
//
//     @Prop({isRequired: true})
//     passwordSalt:string
// }
// export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
//
//
// export class EmailConfirmation {
//     @Prop({isRequired: true})
//     confirmationCode: string
//
//     @Prop({isRequired: true})
//     confirmationDate:Date
//
//     @Prop({isRequired: true})
//     isConfirmed:boolean
// }
//
// export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);
//
//
// @Schema()
// export class User {
//     @Prop({ type: AccountDataSchema  })
//     accountData: AccountData;
//
//     // Single example
//     @Prop({ type: EmailConfirmationSchema })
//     emailConfirmation: EmailConfirmation;
// }
//
// export const UserSchema = SchemaFactory.createForClass(User);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({isRequired:true})
    login: string;

    @Prop({isRequired:true})
    email: string;

    @Prop({isRequired:true})
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
