import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuizSession, QuizSessionSchema } from './schemas/quizSession.schema';
import { Leaderboard, LeaderboardSchema } from './schemas/leaderboard.schema';
import { LeaderboardHistory, LeaderboardHistorySchema } from './schemas/leaderboard-history.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Quiz', schema: QuizSchema },
      { name: 'Question', schema: QuestionSchema },
      { name: 'QuizSession', schema: QuizSessionSchema },
      { name: 'Leaderboard', schema: LeaderboardSchema },
      { name: 'LeaderboardHistory', schema: LeaderboardHistorySchema },
    ]), UsersModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule { }
