import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './schemas/quiz.schema';
import { Question } from './schemas/question.schema';
import { QuizSession } from './schemas/quizSession.schema';
import { Leaderboard } from './schemas/leaderboard.schema';
import { LeaderboardHistory } from './schemas/leaderboard-history.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('Quiz') private readonly quizModel: Model<Quiz>,
    @InjectModel('Question') private readonly questionModel: Model<Question>,
    @InjectModel('QuizSession') private readonly quizSessionModel: Model<QuizSession>,
    @InjectModel('Leaderboard') private readonly leaderboardModel: Model<Leaderboard>,
    @InjectModel('LeaderboardHistory') private readonly leaderboardHistoryModel: Model<LeaderboardHistory>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) { }

  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const { day, week, month, questions } = createQuizDto;

    // Save questions first
    const savedQuestions = await this.questionModel.insertMany(questions);
    const questionIds = savedQuestions.map(question => question._id);

    // Create the quiz
    const quiz = new this.quizModel({
      day,
      week,
      month,
      questionIds,
      status: 'Inactive',
      createdAt: new Date(),
    });

    try {
      return await quiz.save();
    } catch (error) {
      console.error(error);
      throw new HttpException('Failed to create quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async activateQuiz(quizId: string): Promise<Quiz | null> {
    try {
      return await this.quizModel.findByIdAndUpdate(quizId, { status: 'Active' }, { new: true });
    } catch (error) {
      throw new HttpException('Failed to activate quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deactivateQuiz(quizId: string): Promise<Quiz | null> {
    try {
      return await this.quizModel.findByIdAndUpdate(quizId, { status: 'Inactive' }, { new: true });
    } catch (error) {
      throw new HttpException('Failed to deactivate quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getActiveQuiz(): Promise<Quiz | null> {
    try {
      const activeQuiz = await this.quizModel
        .findOne({ status: 'Active' })
        .populate({
          path: 'questionIds',
          model: 'Question', // Specify the model to populate from
        })
        .exec();
      return activeQuiz;
    } catch (error) {
      throw new HttpException('Failed to retrieve active quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getQuizzesByDay(day: number): Promise<Quiz[]> {
    try {
      const quizzes = await this.quizModel
        .find({ day, status: 'Active' }) // Add status filter
        .populate({
          path: 'questionIds',
          model: 'Question', // Populate questions for each quiz
        })
        .exec();
      return quizzes;
    } catch (error) {
      throw new HttpException('Failed to retrieve quizzes by day', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async markQuestion(questionId: string, selectedOption: string): Promise<boolean> {
    try {
      const question = await this.questionModel.findById(questionId).exec();
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return question.correctOption === selectedOption;
    } catch (error) {
      throw new HttpException('Failed to mark question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<Quiz[]> {
    try {
      return await this.quizModel.find().exec();
    } catch (error) {
      throw new HttpException('Failed to retrieve quizzes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Quiz | null> {
    try {
      return await this.quizModel.findById(id).populate('questionIds').exec();
    } catch (error) {
      throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
    }
  }



  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    try {
      return await this.quizModel.findByIdAndUpdate(id, updateQuizDto, { new: true }).exec();
    } catch (error) {
      throw new HttpException('Failed to update quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.quizModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new HttpException('Failed to delete quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async createQuizSession(userId: string, quizId: string, score: number): Promise<{ quizSession: QuizSession; rank: number; currentWeekTotal: number }> {
    const quizSession = new this.quizSessionModel({
      userId,
      quizId,
      score,
    });

    // Update leaderboard and get user's rank and current week total
    const { rank, currentWeekTotal } = await this.updateLeaderboard(userId, score);

    const savedSession = await quizSession.save();
    return { quizSession: savedSession, rank, currentWeekTotal };
  }

  async updateLeaderboard(userId: string, score: number): Promise<{ rank: number; currentWeekTotal: number }> {
    const week = this.getCurrentWeekNumber();
    let userLeaderboard = await this.leaderboardModel.findOne({ userId });
  
    if (userLeaderboard) {
      // Update existing leaderboard entry
      const currentTotal = parseFloat(userLeaderboard.currentWeekTotal.toString()) || 0;
      const grandTotal = parseFloat(userLeaderboard.grandtotal.toString()) || 0;
  
      userLeaderboard.currentWeekTotal = currentTotal + Number(score);
      userLeaderboard.grandtotal = grandTotal + Number(score);
      userLeaderboard.currentWeek = week;
    } else {
      // Create new leaderboard entry
      userLeaderboard = new this.leaderboardModel({
        userId,
        grandtotal: score,
        currentWeekTotal: score,
        lastWeekTotal: 0,
        currentWeek: week,
      });
    }
  
    await userLeaderboard.save();
  
    // Recalculate rankings
    const allRankings = await this.leaderboardModel
      .find({ currentWeek: week })
      .sort({ currentWeekTotal: -1 })
      .exec();
  
    // Update ranks in bulk
    const bulkOps = allRankings.map((doc, index) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { rank: index + 1 } }
      }
    }));
  
    await this.leaderboardModel.bulkWrite(bulkOps);
  
    // Get the updated rank and currentWeekTotal for the user
    const updatedUser = await this.leaderboardModel.findOne({ userId });
  
    // Update user's rank, currentWeekPoints, and total points in the user model
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          currentRank: updatedUser.rank,
          points: updatedUser.grandtotal,
          currentWeekPoints: updatedUser.currentWeekTotal,
        },
      }
    );
  
    return {
      rank: updatedUser.rank,
      currentWeekTotal: parseFloat(updatedUser.currentWeekTotal.toString()) || 0,
    };
  }
  

  @Cron('0 0 * * 0') // Custom cron expression for every Sunday at midnight
  async handleCron(): Promise<void> {
    await this.resetWeeklyTotals();
  }

  async resetWeeklyTotals(): Promise<void> {
    const week = this.getCurrentWeekNumber();
    const lastWeek = week - 1;

    // Create leaderboard history
    const rankings = await this.leaderboardModel
      .find({ currentWeek: lastWeek })
      .sort({ grandtotal: -1 })
      .exec();

    const leaderboardHistory = rankings.map((entry, index) => ({
      userId: entry.userId,
      rank: index + 1,
    }));

    await this.leaderboardHistoryModel.create({
      week: lastWeek,
      rankings: leaderboardHistory,
    });

    // Move current week total to last week and reset current week total
    await this.leaderboardModel.updateMany(
      { currentWeek: week },
      {
        $set: { lastWeekTotal: '$currentWeekTotal', currentWeekTotal: 0 },
      },
    );
  }

  private getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }
  async getCurrentWeekLeaderboard(): Promise<Array<{ fullName: string, currentWeekTotal: number, rank: number }>> {
    const week = this.getCurrentWeekNumber();
    console.log(week)
    // Find all leaderboard entries for the current week, sorted by currentWeekTotal in descending order
    const leaderboard = await this.leaderboardModel
      .find({ currentWeek: week })
      .sort({ currentWeekTotal: -1 })
      .populate('userId', 'fullName') // Populate only the fullName from the User model
      .exec();

    console.log(leaderboard)

    // Map the leaderboard data to return only fullName, currentWeekTotal, and rank
    return leaderboard.map((entry) => {
      const user = entry.userId as User; // Cast userId as User to access fullName
      return {
        fullName: user.fullName, // Only return the fullName
        currentWeekTotal: entry.currentWeekTotal,
        rank: entry.rank,
      };
    });
  }

}

