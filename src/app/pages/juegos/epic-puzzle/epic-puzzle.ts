import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Hero } from '../../../components/hero/hero';
import { AuthService } from '../../../services/auth.service';
import { SeoService } from '../../../services/seo.service';
import { EPIC_PUZZLE_QUESTIONS } from './epic-puzzle-questions';

export interface PuzzleQuestion {
  id: number;
  imageUrl: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;
  historical_context?: string;
}

@Component({
  selector: 'app-epic-puzzle',
  standalone: true,
  imports: [CommonModule, RouterLink, Hero],
  templateUrl: './epic-puzzle.html',
  styleUrl: './epic-puzzle.scss',
})
export class EpicPuzzle implements OnInit {
  private seo = inject(SeoService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  currentQuestion = signal<number>(0);
  score = signal<number>(0);
  selectedAnswer = signal<string | null>(null);
  answered = signal<boolean>(false);
  gameFinished = signal<boolean>(false);
  gameStarted = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  QUESTIONS_PER_GAME = 5;
  POINTS_PER_CORRECT_ANSWER = 2;
  MAX_POINTS_PER_GAME = this.QUESTIONS_PER_GAME * this.POINTS_PER_CORRECT_ANSWER;

  questions = signal<PuzzleQuestion[]>([]);

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'EpicPuzzle - Juego de Adivinanzas Históricas',
      description:
        'Adivina qué evento histórico se esconde en cada imagen de puzzle. Demuestra que conoces bien los grandes momentos de la historia.',
      keywords: 'puzzle historia, juego historia, adivinanzas históricas, eventos históricos',
      url: 'https://epicstoria.es/juegos/epic-puzzle',
      type: 'website',
    });
    this.loadRandomQuestions();
  }

  private loadRandomQuestions(): void {
    const shuffled = [...EPIC_PUZZLE_QUESTIONS].sort(() => Math.random() - 0.5);
    const randomQuestions = shuffled.slice(0, this.QUESTIONS_PER_GAME);
    this.questions.set(randomQuestions);
  }

  get currentQuestionData(): PuzzleQuestion {
    return this.questions()[this.currentQuestion()];
  }

  selectAnswer(answer: string): void {
    if (this.answered()) return;

    this.selectedAnswer.set(answer);
    this.answered.set(true);

    // Verificar si la respuesta es correcta
    if (answer === this.currentQuestionData.correctAnswer) {
      this.score.update((s) => s + this.POINTS_PER_CORRECT_ANSWER);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestion() < this.questions().length - 1) {
      this.currentQuestion.update((q) => q + 1);
      this.selectedAnswer.set(null);
      this.answered.set(false);
    } else {
      this.finishGame();
    }
  }

  private finishGame(): void {
    this.gameFinished.set(true);
    // Guardar los puntos en la base de datos si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      const gameData = {
        game_id: 'epic-puzzle',
        score: this.score(),
        max_score: this.MAX_POINTS_PER_GAME,
        difficulty: 'medium',
      };

      this.http
        .post(`${environment.apiUrl}/games/complete`, gameData, {
          headers: this.authService.getAuthHeaders(),
        })
        .subscribe({
          next: () => {
            // Puntos guardados exitosamente
            this.authService.refreshProfile();
          },
          error: (error) => {
            console.error('Error al guardar puntos:', error);
          },
        });
    }
  }

  startGame(): void {
    this.gameStarted.set(true);
  }

  restartGame(): void {
    this.currentQuestion.set(0);
    this.score.set(0);
    this.selectedAnswer.set(null);
    this.answered.set(false);
    this.gameFinished.set(false);
    this.gameStarted.set(false);
    this.loadRandomQuestions();
  }

  isAnswerCorrect(answer: string): boolean {
    return answer === this.currentQuestionData.correctAnswer;
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-900/50 border-green-600 text-green-200';
      case 'medium':
        return 'bg-yellow-900/50 border-yellow-600 text-yellow-200';
      case 'hard':
        return 'bg-red-900/50 border-red-600 text-red-200';
      default:
        return 'bg-gray-900/50 border-gray-600 text-gray-200';
    }
  }
}
