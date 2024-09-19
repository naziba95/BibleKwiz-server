import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;
  
  @Prop({ required: true })
  phoneNumber: string;
  @Prop({ required: true, default : 200 })
  currentRank: string;
  @Prop({ required: true , default : 0})
  points: number;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
