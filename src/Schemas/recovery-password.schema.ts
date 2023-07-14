import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type recoveryPasswordDocument = HydratedDocument<RecoveryPassword>;

@Schema()
export class RecoveryPassword {
  @Prop({ isRequired: true })
  userId:string
  @Prop({ isRequired: true })
  code:string
}

export const RecoveryPasswordSchema = SchemaFactory.createForClass(RecoveryPassword);
