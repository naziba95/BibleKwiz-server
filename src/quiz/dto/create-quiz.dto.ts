import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  optionA: string;

  @IsString()
  @IsNotEmpty()
  optionB: string;

  @IsString()
  @IsNotEmpty()
  optionC: string;

  @IsString()
  @IsNotEmpty()
  optionD: string;

  @IsString()
  @IsNotEmpty()
  correctOption: string;
}

export class CreateQuizDto {
  @IsNumber()
  @IsNotEmpty()
  day: number;  // Assuming day is a number (e.g., day of the month)

  @IsNumber()
  @IsNotEmpty()
  week: number; // Assuming week is a number (e.g., week of the year)

  @IsNumber()
  @IsNotEmpty()
  month: number; // Assuming month is a number (e.g., 1 for January, 2 for February, etc.)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
