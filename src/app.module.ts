import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { QuizModule } from './quiz/quiz.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ConfigModule.forRoot(), // Loads .env file
    MongooseModule.forRoot(process.env.MONGO_URI || ''), // Use environment variable for MongoDB URI
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Access environment variable
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    QuizModule,
    ScheduleModule.forRoot(),
   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
