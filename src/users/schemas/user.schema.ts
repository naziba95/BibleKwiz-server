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
  @Prop({ required: true, default : 0 })
  currentRank: string;
  @Prop({ required: true , default : 0})
  points: number;

  @Prop({ required: true })
  password: string;


 // New field to track quiz completion status for Day 1 to Day 6
 @Prop({
  type: Array,
  default: [
    { day: 1, status: 'N' },
    { day: 2, status: 'N' },
    { day: 3, status: 'N' },
    { day: 4, status: 'N' },
    { day: 5, status: 'N' },
    { day: 6, status: 'N' },
  ],
})
quizCompletionStatus: { day: number; status: string }[];


  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
