import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PointsHistory,
  QuizCompletion,
  QuizCompletionRequest,
  QuizStatusResponse,
} from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private apiUrl = `${environment.apiUrl}/points`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Completa un quiz y otorga puntos
   */
  completeQuiz(data: QuizCompletionRequest): Observable<{
    success: boolean;
    data: {
      completion: QuizCompletion;
      points_earned: number;
      can_retry_at: Date;
    };
  }> {
    return this.http.post<{
      success: boolean;
      data: {
        completion: QuizCompletion;
        points_earned: number;
        can_retry_at: Date;
      };
    }>(`${this.apiUrl}/quiz`, data, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Obtiene el historial de puntos del usuario
   */
  getPointsHistory(): Observable<{ success: boolean; data: PointsHistory[] }> {
    return this.http.get<{ success: boolean; data: PointsHistory[] }>(`${this.apiUrl}/history`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Obtiene el historial de quizzes completados
   */
  getQuizCompletions(): Observable<{ success: boolean; data: QuizCompletion[] }> {
    return this.http.get<{ success: boolean; data: QuizCompletion[] }>(
      `${this.apiUrl}/quiz-completions`,
      {
        headers: this.authService.getAuthHeaders(),
      },
    );
  }

  /**
   * Verifica si el usuario puede tomar el quiz de un evento
   */
  getQuizStatus(eventId: string): Observable<{ success: boolean; data: QuizStatusResponse }> {
    return this.http.get<{ success: boolean; data: QuizStatusResponse }>(
      `${this.apiUrl}/quiz/${eventId}/status`,
      {
        headers: this.authService.getAuthHeaders(),
      },
    );
  }

  /**
   * Calcula los puntos basados en el porcentaje
   */
  calculatePoints(percentage: number): number {
    if (percentage < 50) {
      return 0;
    }
    return Math.floor(percentage / 10);
  }

  /**
   * Calcula las estrellas basadas en los puntos
   */
  calculateStars(points: number): number {
    return Math.floor(points / 100);
  }

  /**
   * Obtiene el array de estrellas para mostrar en la UI
   */
  getStarsArray(points: number): number[] {
    const stars = this.calculateStars(points);
    return Array(stars).fill(0);
  }

  /**
   * Calcula los puntos para la siguiente estrella
   */
  getPointsToNextStar(points: number): number {
    const currentStars = this.calculateStars(points);
    const nextStarPoints = (currentStars + 1) * 100;
    return nextStarPoints - points;
  }

  /**
   * Obtiene la tabla de líderes
   */
  getLeaderboard(
    limit: number = 10,
    offset: number = 0,
  ): Observable<{
    success: boolean;
    data: {
      leaderboard: Array<{
        id: number;
        name: string;
        lastname?: string;
        avatar_url?: string;
        points: number;
        stars: number;
        quizzes_completed: number;
        created_at: Date;
      }>;
      total: number;
      limit: number;
      offset: number;
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        leaderboard: Array<{
          id: number;
          name: string;
          lastname?: string;
          avatar_url?: string;
          points: number;
          stars: number;
          quizzes_completed: number;
          created_at: Date;
        }>;
        total: number;
        limit: number;
        offset: number;
      };
    }>(`${this.apiUrl}/leaderboard?limit=${limit}&offset=${offset}`);
  }
}
