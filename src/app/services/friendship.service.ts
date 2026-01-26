import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, AreFriendsResponse, Friend, FriendshipResponse } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FriendshipService {
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
   * Añadir un amigo
   */
  addFriend(friendId: number): Observable<void> {
    return this.http
      .post<
        ApiResponse<void>
      >(`${this.apiUrl}/friends/add`, { friendId }, { headers: this.getAuthHeaders() })
      .pipe(map(() => undefined));
  }

  /**
   * Eliminar un amigo
   */
  removeFriend(friendId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/friends/remove/${friendId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map(() => undefined));
  }

  /**
   * Obtener lista de amigos
   */
  getFriends(): Observable<Friend[]> {
    return this.http
      .get<FriendshipResponse>(`${this.apiUrl}/friends/list`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Verificar si dos usuarios son amigos
   */
  areFriends(friendId: number): Observable<boolean> {
    return this.http
      .get<AreFriendsResponse>(`${this.apiUrl}/friends/check/${friendId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data.areFriends));
  }

  /**
   * Obtener todos los usuarios con información de amistad
   */
  getAllUsers(): Observable<Friend[]> {
    return this.http
      .get<ApiResponse<Friend[]>>(`${this.apiUrl}/friends/users`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Buscar usuarios por nombre o email
   */
  searchUsers(searchTerm: string): Observable<Friend[]> {
    return this.http
      .get<ApiResponse<Friend[]>>(`${this.apiUrl}/friends/search`, {
        params: { q: searchTerm },
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }
}
