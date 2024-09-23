import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema } from 'mongoose';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { updateQuestionDto } from './dto/updateQuestion.dto'
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
    const { day, questions } = createQuizDto;

    // Save questions first
    const savedQuestions = await this.questionModel.insertMany(questions);
    const questionIds = savedQuestions.map(question => question._id);

    // Create the quiz
    const quiz = new this.quizModel({
      day,
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

  async getActiveQuiz(): Promise<Quiz[] | null> {
    try {
      const activeQuiz = await this.quizModel
        .find({ status: 'Active' })
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

  async getInactiveQuiz(): Promise<Quiz[] | null> {
    try {
      const activeQuiz = await this.quizModel
        .find({ status: 'Inactive' })
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
      const quiz = await this.quizModel.findById(id).exec();
      if (!quiz) {
        throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
      }

      // Update quiz properties
      if (updateQuizDto.day !== undefined) quiz.day = updateQuizDto.day;
      if (updateQuizDto.week !== undefined) quiz.week = updateQuizDto.week;
      if (updateQuizDto.month !== undefined) quiz.month = updateQuizDto.month;
      if (updateQuizDto.status !== undefined) quiz.status = updateQuizDto.status;

      // Update questions if provided
      if (updateQuizDto.questions && updateQuizDto.questions.length > 0) {
        const updatedQuestionIds: Types.ObjectId[] = [];

        for (let i = 0; i < updateQuizDto.questions.length; i++) {
          const questionDto = updateQuizDto.questions[i];
          const questionId = quiz.questionIds[i];

          if (questionId) {
            // Update existing question
            const updatedQuestion = await this.questionModel.findByIdAndUpdate(
              questionId,
              questionDto,
              { new: true }
            ).exec();
            if (updatedQuestion) {
              updatedQuestionIds.push(updatedQuestion._id as Types.ObjectId);
            }
          } else {
            // Create new question
            const newQuestion = new this.questionModel(questionDto);
            const savedQuestion = await newQuestion.save();
            updatedQuestionIds.push(savedQuestion._id as Types.ObjectId);
          }
        }

        // Assign questionIds, casting to Schema.Types.ObjectId[]
        quiz.questionIds = updatedQuestionIds as unknown as Schema.Types.ObjectId[];
      }

      return await quiz.save();
    } catch (error) {
      throw new HttpException('Failed to update quiz', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async updateQuestion(questionId: string, updateQuestionDto: updateQuestionDto): Promise<Question> {
    try {
      const question = await this.questionModel.findById(questionId).exec();
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }

      if (updateQuestionDto.question !== undefined) question.question = updateQuestionDto.question;
      if (updateQuestionDto.optionA !== undefined) question.optionA = updateQuestionDto.optionA
      if (updateQuestionDto.optionB !== undefined) question.optionB = updateQuestionDto.optionB;
      if (updateQuestionDto.optionC !== undefined) question.optionC = updateQuestionDto.optionC;
      if (updateQuestionDto.optionD !== undefined) question.optionD = updateQuestionDto.optionD;
      if (updateQuestionDto.correctOption !== undefined) question.correctOption = updateQuestionDto.correctOption;

      await question.save()

      return question;

    } catch (error) {
      throw new HttpException('Failed to update question', HttpStatus.INTERNAL_SERVER_ERROR);
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

      // Retrieve the quiz to get the day
  const quiz = await this.quizModel.findById(quizId).exec();
  if (!quiz) {
    throw new Error('Quiz not found');
  }

    // Update leaderboard and get user's rank and current week total
    const { rank, currentWeekTotal } = await this.updateLeaderboard(userId, score);

    const savedSession = await quizSession.save();

     // Update quizCompletionStatus for the specific day to 'Y'
  await this.userModel.updateOne(
    { _id: userId, 'quizCompletionStatus.day': quiz.day },
    { $set: { 'quizCompletionStatus.$.status': 'Y' } }
  );

    return { quizSession: savedSession, rank, currentWeekTotal };
  }

  async updateLeaderboard(userId: string, score: number): Promise<{ rank: number; currentWeekTotal: number }> {
    const week = this.getCurrentWeekNumber();
    let userLeaderboard = await this.leaderboardModel.findOne({ userId });
    console.log(userLeaderboard)
    let newWeekTotal;
    if (userLeaderboard) {
      const currentTotal = parseFloat(userLeaderboard.currentWeekTotal.toString()) || 0;
      console.log(`current week total: ${currentTotal}`)
      const grandTotal = parseFloat(userLeaderboard.grandtotal.toString()) || 0;
  
      userLeaderboard.currentWeekTotal = currentTotal + Number(score);
      newWeekTotal = currentTotal + Number(score);
      console.log(`new week total : ${newWeekTotal}`)
      userLeaderboard.grandtotal = grandTotal + Number(score);
      userLeaderboard.currentWeek = week;
    } else {
      userLeaderboard = new this.leaderboardModel({
        userId,
        grandtotal: score,
        currentWeekTotal: score,
        lastWeekTotal: 0,
        currentWeek: week,
      });
    }
  
    await userLeaderboard.save();
  
    // Recalculate rankings only for users with points > 0
    const allRankings = await this.leaderboardModel
      .find({ currentWeek: week, currentWeekTotal: { $gt: 0 } })
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
     //console.log(updatedUser)
    // Update user's rank, currentWeekPoints, and total points in the user model
    const userToUpdate = await this.userModel.findOne({ _id : userId })
    //console.log(userToUpdate)
    userToUpdate.points = updatedUser.currentWeekTotal;
    userToUpdate.currentRank = updatedUser.rank.toString();
    await userToUpdate.save();
    //console.log(userToUpdate)

    // await this.userModel.updateOne(
    //   { _id: userId },
    //   {
    //     $set: {
    //       currentRank: updatedUser.currentWeekTotal > 0 ? updatedUser.rank : 0,
    //       points: newWeekTotal,
    //     },
        
    //   }
    // );
    

    return {
      rank: updatedUser.currentWeekTotal > 0 ? updatedUser.rank : 0,
      currentWeekTotal: parseFloat(updatedUser.currentWeekTotal.toString()) || 0,
    };
  }


  // @Cron('0 0 * * 0') // Custom cron expression for every Sunday at midnight
  // async handleCron(): Promise<void> {
  //   await this.resetWeeklyTotals();
  // }

  // @Cron('*/2 * * * *') // Runs every 2 minutes
  // async handleCron(): Promise<void> {
  //   await this.resetWeeklyTotals();
  //   console.log("cron job completed")
  // }


  async resetWeeklyTotals(): Promise<void> {
    const week = this.getCurrentWeekNumber();
    const lastWeek = week - 1;
  
    // Fetch all leaderboard rankings for last week
    const rankings = await this.leaderboardModel
      .find({ currentWeek: lastWeek })
      .sort({ currentWeekTotal: -1 })
      .exec();
  
    if (rankings.length > 0) {
      // Map the leaderboard data for the week based on currentWeekTotal
      const leaderboardHistory = rankings.map((entry, index) => ({
        userId: entry.userId,
        rank: entry.currentWeekTotal > 0 ? index + 1 : 0,
        score: entry.currentWeekTotal
      }));
  
      // Save the history for the last week
      await this.leaderboardHistoryModel.create({
        week: lastWeek,
        rankings: leaderboardHistory,
      });
    }
  
    // Reset current week totals and update last week's totals in leaderboard model for all records
    await this.leaderboardModel.updateMany(
      {},
      [
        {
          $set: {
            lastWeekTotal: '$currentWeekTotal',
            currentWeekTotal: 0,
            rank: 0,
            currentWeek: week,
          },
        },
      ]
    );
  
    // Clear current rank and points in the User model and reset quizCompletionStatus
    await this.userModel.updateMany(
      {},
      {
        $set: {
          currentRank: 0,
          points: 0,
          quizCompletionStatus: [
            { day: 1, status: 'N' },
            { day: 2, status: 'N' },
            { day: 3, status: 'N' },
            { day: 4, status: 'N' },
            { day: 5, status: 'N' },
            { day: 6, status: 'N' },
          ],
        },
      }
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
  
    // Find all leaderboard entries for the current week with points > 0, sorted by currentWeekTotal in descending order
    const leaderboard = await this.leaderboardModel
      .find({ currentWeek: week, currentWeekTotal: { $gt: 0 } })
      .sort({ currentWeekTotal: -1 })
      .populate('userId', 'fullName')
      .exec();
  
    if (leaderboard.length === 0) {
      return [];
    }
  
    // Map the leaderboard data and assign ranks
    return leaderboard.map((entry, index) => {
      const user = entry.userId as User;
      return {
        fullName: user.fullName.split(" ")[0],
        currentWeekTotal: entry.currentWeekTotal,
        rank: index + 1, // Assign rank based on the sorted order
      };
    });
  }
}

