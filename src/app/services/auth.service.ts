import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'epicstoria_token';
  private readonly USER_KEY = 'epicstoria_user';

  // Signals para el estado de autenticación
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private isLoadingSignal = signal<boolean>(false);

  // Computed signals públicos
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isLoading = computed(() => this.isLoadingSignal());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Verificar token al iniciar
    this.checkAuthStatus();
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setAuth(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.setAuth(response.data.user, response.data.token);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      }),
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.setAuth(response.data.user, response.data.token);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/']);
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.currentUserSignal.set(response.data);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
          }
        }),
      );
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<User>> {
    this.isLoadingSignal.set(true);

    return this.http
      .put<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.currentUserSignal.set(response.data);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
          }
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.isLoadingSignal.set(false);
          return throwError(() => error);
        }),
      );
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);

    return this.http
      .put<ApiResponse<void>>(`${this.apiUrl}/auth/change-password`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => {
          this.isLoadingSignal.set(false);
          return throwError(() => error);
        }),
      );
  }

  private checkAuthStatus(): void {
    const token = this.getStoredToken();
    if (token) {
      // Verificar que el token sigue siendo válido
      this.getProfile().subscribe({
        error: () => {
          // Token inválido, limpiar
          this.clearAuth();
        },
      });
    }
  }
}
