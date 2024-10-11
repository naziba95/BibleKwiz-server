export class AddQuestionsDto {
    questions: {
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
    }[];
  }
  