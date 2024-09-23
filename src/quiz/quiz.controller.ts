import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Res,
  Put,
  HttpCode,
  HttpException,
  Query
} from '@nestjs/common';
import { Response } from 'express';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { updateQuestionDto } from './dto/updateQuestion.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post('create')
  async create(@Body() createQuizDto: CreateQuizDto, @Res() res: Response): Promise<Response> {
    try {
      console.log(createQuizDto)
      const quiz = await this.quizService.createQuiz(createQuizDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Quiz created successfully',
        data: quiz,
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create quiz',
      });
    }
  }

  @Get('active')
  async getActiveQuiz(@Res() res: Response): Promise<Response> {
    try {
      const activeQuiz = await this.quizService.getActiveQuiz();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Active quiz retrieved successfully',
        data: activeQuiz,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve active quiz',
      });
    }
  }

  @Get('inactive')
  async getInactiveQuiz(@Res() res: Response): Promise<Response> {
    try {
      const activeQuiz = await this.quizService.getInactiveQuiz();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Inactive quiz retrieved successfully',
        data: activeQuiz,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve inactive quiz',
      });
    }
  }

  @Post('activate/:id')
  async activateQuiz(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    try {
      const updatedQuiz = await this.quizService.activateQuiz(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Quiz activated successfully',
        data: updatedQuiz,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to activate quiz',
      });
    }
  }

  @Put('deactivate/:id')
  async deactivateQuiz(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    try {
      const updatedQuiz = await this.quizService.deactivateQuiz(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Quiz deactivated successfully',
        data: updatedQuiz,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to deactivate quiz',
      });
    }
  }

  @Post('mark-question')
  async markQuestion(
    @Body('questionId') questionId: string,
    @Body('selectedOption') selectedOption: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const isCorrect = await this.quizService.markQuestion(questionId, selectedOption);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Question marked successfully',
        data: { isCorrect },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to mark question',
      });
    }
  }

  @Post('updatequestion/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: updateQuestionDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      console.log(updateQuestionDto)
      const updatedQuestion = await this.quizService.updateQuestion(id, updateQuestionDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'updated successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to update question',
      });
    }
  }

  @Get()
  async findAll(@Res() res: Response): Promise<Response> {
    try {
      const quizzes = await this.quizService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Quizzes retrieved successfully',
        data: quizzes,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve quizzes',
      });
    }
  }

  @Get('/getQuiz/:id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    try {
      const quiz = await this.quizService.findOne(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Quiz retrieved successfully',
        data: quiz,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || 'Quiz not found',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const updatedQuiz = await this.quizService.update(id, updateQuizDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Quiz updated successfully',
        data: updatedQuiz,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to update quiz',
      });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    try {
      await this.quizService.remove(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Quiz deleted successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to delete quiz',
      });
    }
  }

  @Post('submit')
  async submitQuiz(
    @Body('userId') userId: string,
    @Body('quizId') quizId: string,
    @Body('score') score: number,
  ) {
    console.log(userId);
    const result = await this.quizService.createQuizSession(userId, quizId, score);
    return { message: 'Quiz session recorded successfully', data: result };
  }

  @Get('Get-leaderBoard')
  async getCurrentWeekLeaderboard() {
    try {
      const leaderboard = await this.quizService.getCurrentWeekLeaderboard();
      return {
        success: true,
        data: leaderboard,
      };
    } catch (error) {
      throw new HttpException('Failed to retrieve current week leaderboard', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('active/byday')
  async getQuizzesByDay(@Query('day') day: string) {
    const dayNumber = parseInt(day, 10);
    if (isNaN(dayNumber)) {
      throw new HttpException('Invalid day parameter', HttpStatus.BAD_REQUEST);
    }

    try {
      const quizzes = await this.quizService.getQuizzesByDay(dayNumber);
      return quizzes;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

