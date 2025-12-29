import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class EventApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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
