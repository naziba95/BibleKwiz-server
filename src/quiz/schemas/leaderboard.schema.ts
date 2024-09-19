import { Schema, Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export const LeaderboardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  grandtotal: { type: Number, default: 0 },
  currentWeek: { type: Number, required: false },
  currentWeekTotal: { type: Number, default: 0 },
  lastWeekTotal: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
});

export interface Leaderboard extends Document {
  userId: User | string;
  grandtotal: number;
  currentWeek: number;
  currentWeekTotal: number;
  lastWeekTotal: number;
  rank: number
}
