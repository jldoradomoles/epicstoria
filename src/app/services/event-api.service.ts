import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';
import { ApiResponse } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EventApiService {
  private readonly apiUrl = environment.apiUrl;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  uploadEventsExcel(
    file: File,
  ): Observable<{ created: number; updated: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<
        ApiResponse<{ created: number; updated: number; errors: string[] }>
      >(`${this.apiUrl}/events/upload`, formData, { headers })
      .pipe(map((response) => response.data));
  }

  getAllEvents(): Observable<Event[]> {
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/events`)
      .pipe(map((response) => response.data));
  }

  getEventById(id: string): Observable<Event> {
    return this.http
      .get<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`)
      .pipe(map((response) => response.data));
  }

  getEventsByCategory(category: string): Observable<Event[]> {
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/events/category/${category}`)
      .pipe(map((response) => response.data));
  }

  searchEvents(query: string): Observable<Event[]> {
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/events/search`, {
        params: { q: query },
      })
      .pipe(map((response) => response.data));
  }

  getCategories(): Observable<string[]> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/events/categories`)
      .pipe(map((response) => response.data));
  }
}
