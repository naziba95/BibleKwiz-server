import { Schema, Document } from 'mongoose';

export const LeaderboardHistorySchema = new Schema({
  week: { type: Number, required: true },
  month: { type: String, required: true },
  rankings: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      rank: { type: Number, required: true },
    },
  ],
});

export interface LeaderboardHistory extends Document {
  week: number;
  rankings: { userId: string; rank: number }[];
}
