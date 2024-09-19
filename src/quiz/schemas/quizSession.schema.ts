import { Schema, Document } from 'mongoose';

export interface QuizSession extends Document {
  userId: string;
  quizId: string;
  score: number;
  timestamp: Date;
}

export const QuizSessionSchema = new Schema<QuizSession>({
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});
