import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, Subject, tap, throwError } from 'rxjs';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals para el estado de autenticación
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private isLoadingSignal = signal<boolean>(false);

  // Subject para emitir cambios en el usuario
  private currentUserSubject = new Subject<User | null>();
  public currentUser$ = this.currentUserSubject.asObservable();

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
    if (!this.isBrowser) return null;
    const userJson = sessionStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private getStoredToken(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private setAuth(user: User, token: string): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
    this.currentUserSubject.next(user);
  }

  private clearAuth(): void {
    if (!this.isBrowser) return;
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
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
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
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
            sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
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

  /**
   * Refresca el perfil del usuario desde el servidor
   */
  refreshProfile(): void {
    this.getProfile().subscribe({
      error: (error) => {
        console.error('Error refreshing profile:', error);
      },
    });
  }

  /**
   * Solicita un reset de contraseña enviando un email con el token
   */
  forgotPassword(email: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/forgot-password`, { email }).pipe(
      tap(() => {
        this.isLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Resetea la contraseña usando el token recibido por email
   */
  resetPassword(token: string, password: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);

    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/auth/reset-password`, { token, password })
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
}
