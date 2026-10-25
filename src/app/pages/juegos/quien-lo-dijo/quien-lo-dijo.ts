import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Hero } from '../../../components/hero/hero';
import { AuthService } from '../../../services/auth.service';
import { PointsService } from '../../../services/points.service';
import { SeoService } from '../../../services/seo.service';
import { QUIEN_LO_DIJO_QUESTIONS } from './quien-lo-dijo-questions';

export interface QuoteQuestion {
  id: number;
  quote: string;
  author: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  historical_context?: string;
  year?: number;
}

@Component({
  selector: 'app-quien-lo-dijo',
  standalone: true,
  imports: [CommonModule, RouterLink, Hero],
  templateUrl: './quien-lo-dijo.html',
  styleUrl: './quien-lo-dijo.scss',
})
export class QuienLoDijo implements OnInit {
  private seo = inject(SeoService);
  public authService = inject(AuthService);
  private pointsService = inject(PointsService);
  private http = inject(HttpClient);

  // Exponemos String al template
  String = String;

  // Constantes del juego
  readonly QUESTIONS_PER_GAME = 5;
  readonly POINTS_PER_CORRECT_ANSWER = 2;
  readonly MAX_POINTS_PER_GAME = this.QUESTIONS_PER_GAME * this.POINTS_PER_CORRECT_ANSWER; // 10 puntos

  // Señales de estado
  currentQuestion = signal<number>(0);
  score = signal<number>(0);
  selectedAnswer = signal<string | null>(null);
  answered = signal<boolean>(false);
  gameFinished = signal<boolean>(false);
  gameStarted = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Preguntas de ejemplo
  questions = signal<QuoteQuestion[]>([]);

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: '¿Quién lo dijo? - Juego de Citas Históricas',
      description:
        'Adivina quién pronunció cada cita histórica. Desafía tu conocimiento de la historia y demuestra que eres un verdadero historiador.',
      keywords: 'quiz citas, juego historia, citas célebres, personajes históricos',
      url: 'https://epicstoria.es/juegos/quien-lo-dijo',
      type: 'website',
    });
    this.loadRandomQuestions();
  }

  private loadRandomQuestions(): void {
    const shuffled = [...QUIEN_LO_DIJO_QUESTIONS].sort(() => Math.random() - 0.5);
    const randomQuestions = shuffled.slice(0, this.QUESTIONS_PER_GAME);
    this.questions.set(randomQuestions);
  }

  get currentQuestionData(): QuoteQuestion {
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
        game_id: 'quien-lo-dijo',
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

  getPercentage(): number {
    return Math.round((this.score() / this.MAX_POINTS_PER_GAME) * 100);
  }
}
