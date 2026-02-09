import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/user.model';
import { AuthService } from './auth.service';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: Date;
  read: boolean;
}

export interface SendMessageRequest {
  receiver_id: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = environment.apiUrl;
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  /**
   * Obtiene los headers con autenticación
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Obtener mensajes con un usuario específico
   */
  getMessages(userId: number): Observable<Message[]> {
    return this.http
      .get<ApiResponse<Message[]>>(`${this.apiUrl}/chat/${userId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Enviar un mensaje a un usuario
   */
  sendMessage(receiverId: number, message: string): Observable<Message> {
    return this.http
      .post<
        ApiResponse<Message>
      >(`${this.apiUrl}/chat/send`, { receiver_id: receiverId, message }, { headers: this.getAuthHeaders() })
      .pipe(map((response) => response.data));
  }

  /**
   * Marcar mensajes como leídos
   */
  markAsRead(userId: number): Observable<void> {
    return this.http
      .put<
        ApiResponse<void>
      >(`${this.apiUrl}/chat/read/${userId}`, {}, { headers: this.getAuthHeaders() })
      .pipe(map(() => undefined));
  }

  /**
   * Obtener número de mensajes no leídos
   */
  getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<{ count: number }>>(`${this.apiUrl}/chat/unread`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data.count));
  }

  /**
   * Obtener número de mensajes no leídos agrupados por usuario
   */
  getUnreadCountByUser(): Observable<{ [userId: number]: number }> {
    return this.http
      .get<ApiResponse<{ [userId: number]: number }>>(`${this.apiUrl}/chat/unread-by-user`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }
}
