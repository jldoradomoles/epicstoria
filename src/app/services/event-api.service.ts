import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event } from '../models/event.model';
import { ApiResponse } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EventApiService {
  private readonly apiUrl = environment.apiUrl;
  private readonly useStaticData = environment.useStaticData;
  private authService = inject(AuthService);
  private cachedEvents: Event[] | null = null;

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
    // Si estamos usando datos estáticos (GitHub Pages), cargar desde JSON
    if (this.useStaticData) {
      if (this.cachedEvents) {
        return of(this.cachedEvents);
      }
      return this.http.get<Event[]>('data/events.json').pipe(
        map((events) => {
          this.cachedEvents = events;
          return events;
        }),
      );
    }

    // En desarrollo, usar el backend
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/events`)
      .pipe(map((response) => response.data));
  }

  getEventById(id: string): Observable<Event> {
    // Si estamos usando datos estáticos, buscar en el JSON
    if (this.useStaticData) {
      return this.getAllEvents().pipe(
        map((events) => {
          // Buscar primero por slug, luego por id (compatibilidad)
          const event = events.find((e) => e.slug === id || e.id === id);
          if (!event) {
            throw new Error(`Event with id/slug ${id} not found`);
          }
          return event;
        }),
        catchError((error) => {
          console.error('Error finding event:', error);
          return throwError(() => error);
        }),
      );
    }

    // En desarrollo, usar el backend (acepta tanto ID como slug)
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Error loading event from API:', error);
        return throwError(() => error);
      }),
    );
  }

  getEventsByCategory(category: string): Observable<Event[]> {
    // Si estamos usando datos estáticos, filtrar del JSON
    if (this.useStaticData) {
      return this.getAllEvents().pipe(
        map((events) => events.filter((e) => e.category.toLowerCase() === category.toLowerCase())),
      );
    }

    // En desarrollo, usar el backend
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/events/category/${category}`)
      .pipe(map((response) => response.data));
  }

  searchEvents(query: string): Observable<Event[]> {
    // Si estamos usando datos estáticos, buscar en el JSON
    if (this.useStaticData) {
      const lowerQuery = query.toLowerCase();
      return this.getAllEvents().pipe(
        map((events) =>
          events.filter(
            (e) =>
              e.title.toLowerCase().includes(lowerQuery) ||
              e.summary.toString().toLowerCase().includes(lowerQuery) ||
              e.context.toString().toLowerCase().includes(lowerQuery),
          ),
        ),
      );
    }

    // En desarrollo, usar el backend
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/events/search`, {
        params: { q: query },
      })
      .pipe(map((response) => response.data));
  }

  getCategories(): Observable<string[]> {
    // Si estamos usando datos estáticos, extraer categorías del JSON
    if (this.useStaticData) {
      return this.getAllEvents().pipe(
        map((events) => {
          const categories = new Set(events.map((e) => e.category));
          return Array.from(categories).sort();
        }),
      );
    }

    // En desarrollo, usar el backend
    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/events/categories`)
      .pipe(map((response) => response.data));
  }

  uploadEventImage(
    file: File,
  ): Observable<{ filename: string; imageUrl: string; originalName: string; size: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<
        ApiResponse<{ filename: string; imageUrl: string; originalName: string; size: number }>
      >(`${this.apiUrl}/events/upload-image`, formData, { headers })
      .pipe(map((response) => response.data));
  }

  uploadEventImages(
    files: File[],
  ): Observable<Array<{ filename: string; imageUrl: string; originalName: string; size: number }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<
        ApiResponse<
          Array<{ filename: string; imageUrl: string; originalName: string; size: number }>
        >
      >(`${this.apiUrl}/events/upload-images`, formData, { headers })
      .pipe(map((response) => response.data));
  }
}
