/**
 * Modelo para las preguntas del quiz
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // índice de la opción correcta (0-3)
  explanation?: string; // explicación opcional de por qué es correcta
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  answers: QuizAnswer[];
  pointsEarned?: number;
  canRetryAt?: Date;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface EventQuiz {
  eventId: string;
  eventTitle: string;
  questions: QuizQuestion[];
}
