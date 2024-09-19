import { Schema, Document } from 'mongoose';
import { Question } from './question.schema';

export interface Quiz extends Document {
  day: number;
  week: number;
  month: number;
  questionIds: Schema.Types.ObjectId[];
  status: string;
  createdAt: Date;
}

export const QuizSchema = new Schema<Quiz>({
  day: { type: Number, required: true },
  week: { type: Number, required: true },
  month: { type: Number, required: true },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Inactive' },
  createdAt: { type: Date, default: Date.now },
});
