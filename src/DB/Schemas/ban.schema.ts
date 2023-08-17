import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Ban {
  @Prop({ isRequired: true })
  isBanned: boolean;

  @Prop({ isRequired: true })
  banDate: string;

  @Prop({ isRequired: true })
  banReason: string;
}

export const BanSchema = SchemaFactory.createForClass(Ban);
