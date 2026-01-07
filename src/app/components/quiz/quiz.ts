import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Event } from '../../models/event.model';
import { EventQuiz, QuizAnswer, QuizQuestion, QuizResult } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class QuizComponent implements OnInit {
  @Input() event!: Event;

  quiz: EventQuiz | null = null;
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  showResult = false;
  quizResult: QuizResult | null = null;
  isQuizStarted = false;

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.generateQuiz();
  }

  generateQuiz() {
    if (this.event) {
      this.quiz = this.quizService.generateEventQuiz(this.event);
    }
  }

  startQuiz() {
    this.isQuizStarted = true;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = Array(this.quiz?.questions.length || 0).fill(null);
    this.showResult = false;
    this.quizResult = null;
  }

  selectAnswer(answerIndex: number) {
    // Validar que el índice de respuesta sea válido
    if (typeof answerIndex !== 'number' || isNaN(answerIndex) || answerIndex < 0) {
      console.warn('Invalid answer index:', answerIndex);
      return;
    }

    // Validar que el índice actual de pregunta sea válido
    if (
      typeof this.currentQuestionIndex !== 'number' ||
      isNaN(this.currentQuestionIndex) ||
      this.currentQuestionIndex < 0
    ) {
      console.warn('Invalid current question index:', this.currentQuestionIndex);
      return;
    }

    this.selectedAnswers[this.currentQuestionIndex] = answerIndex;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.quiz!.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.finishQuiz();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  finishQuiz() {
    if (!this.quiz) return;

    const answers: QuizAnswer[] = this.quiz.questions.map((question, index) => {
      const selectedAnswer = this.selectedAnswers[index];
      // Validar que selectedAnswer sea un número válido
      const validSelectedAnswer =
        typeof selectedAnswer === 'number' && !isNaN(selectedAnswer) && selectedAnswer >= 0
          ? selectedAnswer
          : -1;

      // Validar que correctAnswer sea un número válido
      const correctAnswer = question.correctAnswer;
      const validCorrectAnswer =
        typeof correctAnswer === 'number' && !isNaN(correctAnswer) && correctAnswer >= 0
          ? correctAnswer
          : -1;

      return {
        questionId: question.id,
        selectedAnswer: validSelectedAnswer,
        isCorrect: validSelectedAnswer === validCorrectAnswer && validSelectedAnswer !== -1,
      };
    });

    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const percentage = this.quizService.calculateScore(this.quiz.questions.length, correctAnswers);

    this.quizResult = {
      totalQuestions: this.quiz.questions.length,
      correctAnswers,
      percentage,
      answers,
    };

    this.showResult = true;
  }

  restartQuiz() {
    this.generateQuiz();
    this.isQuizStarted = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.showResult = false;
    this.quizResult = null;
  }

  get currentQuestion(): QuizQuestion | null {
    const question = this.quiz?.questions[this.currentQuestionIndex];
    if (!question) return null;

    // Validar y limpiar las opciones para evitar valores NaN o undefined
    const validOptions = question.options.map((option, index) => {
      if (
        option === null ||
        option === undefined ||
        (typeof option === 'number' && isNaN(option))
      ) {
        console.warn(`Invalid option at index ${index}:`, option);
        return `Opción ${index + 1}`;
      }
      return String(option);
    });

    return {
      ...question,
      options: validOptions,
    };
  }

  get isLastQuestion(): boolean {
    return this.quiz ? this.currentQuestionIndex === this.quiz.questions.length - 1 : false;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get hasSelectedAnswer(): boolean {
    const selectedAnswer = this.selectedAnswers[this.currentQuestionIndex];
    return typeof selectedAnswer === 'number' && !isNaN(selectedAnswer) && selectedAnswer >= 0;
  }

  get progressPercentage(): number {
    if (!this.quiz) return 0;
    // Contar cuántas preguntas han sido respondidas
    const answeredQuestions = this.selectedAnswers.filter(
      (answer) => typeof answer === 'number' && !isNaN(answer) && answer >= 0,
    ).length;
    return (answeredQuestions / this.quiz.questions.length) * 100;
  }

  get scoreMessage() {
    if (!this.quizResult) return null;
    return this.quizService.getScoreMessage(this.quizResult.percentage);
  }

  // Métodos helper para el template
  getQuestionText(index: number): string {
    if (typeof index !== 'number' || isNaN(index) || index < 0) return 'Pregunta no disponible';
    return this.quiz?.questions?.[index]?.question || 'Pregunta no disponible';
  }

  getOptionText(questionIndex: number, optionIndex: number): string {
    if (typeof questionIndex !== 'number' || isNaN(questionIndex) || questionIndex < 0)
      return 'Opción no disponible';
    if (typeof optionIndex !== 'number' || isNaN(optionIndex) || optionIndex < 0)
      return 'Opción no disponible';
    return this.quiz?.questions?.[questionIndex]?.options?.[optionIndex] || 'Opción no disponible';
  }

  getCorrectAnswerText(questionIndex: number): string {
    if (typeof questionIndex !== 'number' || isNaN(questionIndex) || questionIndex < 0)
      return 'Respuesta no disponible';
    const question = this.quiz?.questions?.[questionIndex];
    if (!question) return 'No disponible';
    const correctAnswerIndex = question.correctAnswer;
    if (
      typeof correctAnswerIndex !== 'number' ||
      isNaN(correctAnswerIndex) ||
      correctAnswerIndex < 0
    ) {
      return 'Respuesta no disponible';
    }
    return question.options?.[correctAnswerIndex] || 'Respuesta no disponible';
  }
}
