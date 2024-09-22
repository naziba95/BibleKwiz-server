import { IsArray, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateQuestionDto {
  @IsOptional()
  question: string;

  @IsOptional()
  optionA: string;

  @IsOptional()
  optionB: string;

  @IsOptional()
  optionC: string;

  @IsOptional()
  optionD: string;

  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  correctOption: string;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsNumber()
  day?: number;

  @IsOptional()
  @IsNumber()
  week?: number;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];
}