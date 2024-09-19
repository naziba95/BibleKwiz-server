import { Schema, Document } from 'mongoose';

export interface Question extends Document {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export const QuestionSchema = new Schema<Question>({
  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  correctOption: { type: String, required: true },
});
