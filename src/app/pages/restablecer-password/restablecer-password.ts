import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restablecer-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen py-12 px-4">
      <div class="max-w-md mx-auto">
        <!-- Logo / Título -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-block">
            <h1 class="title-font text-4xl text-amber-100 hover:text-amber-200 transition-colors">
              Epicstoria
            </h1>
          </a>
          <p class="mt-2 text-amber-200/70">Restablece tu contraseña</p>
        </div>

        <!-- Card del formulario -->
        <div class="container-custom rounded-xl p-8">
          @if (success) {
            <!-- Éxito -->
            <div class="text-center space-y-4">
              <div class="text-6xl">✅</div>
              <h3 class="text-2xl font-bold text-amber-100">¡Contraseña actualizada!</h3>
              <p class="text-amber-200/80">Tu contraseña ha sido cambiada exitosamente.</p>
              <button
                (click)="goToLogin()"
                class="w-full mt-6 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300"
              >
                <i class="fas fa-sign-in-alt mr-2"></i>
                Iniciar sesión
              </button>
            </div>
          } @else if (invalidToken) {
            <!-- Token inválido -->
            <div class="text-center space-y-4">
              <div class="text-6xl">⚠️</div>
              <h3 class="text-2xl font-bold text-amber-100">Token inválido o expirado</h3>
              <p class="text-amber-200/80">El enlace de recuperación ha expirado o no es válido.</p>
              <button
                routerLink="/recuperar-password"
                class="w-full mt-6 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300"
              >
                <i class="fas fa-redo mr-2"></i>
                Solicitar nuevo enlace
              </button>
            </div>
          } @else {
            <!-- Formulario -->
            <form [formGroup]="restablecerPasswordForm" (ngSubmit)="onSubmit()">
              <div class="space-y-6">
                <!-- Nueva contraseña -->
                <div>
                  <label for="password" class="block text-amber-100 text-sm font-medium mb-2">
                    Nueva Contraseña
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input
                      id="password"
                      [type]="showPassword ? 'text' : 'password'"
                      formControlName="password"
                      autocomplete="new-password"
                      class="w-full pl-10 pr-12 py-3 bg-stone-800/50 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                      placeholder="Mínimo 6 caracteres"
                      [class.border-red-500]="
                        restablecerPasswordForm.get('password')?.invalid &&
                        restablecerPasswordForm.get('password')?.touched
                      "
                    />
                    <button
                      type="button"
                      (click)="togglePassword()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
                    >
                      <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  @if (
                    restablecerPasswordForm.get('password')?.invalid &&
                    restablecerPasswordForm.get('password')?.touched
                  ) {
                    <p class="mt-2 text-red-400 text-sm">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  }
                </div>

                <!-- Confirmar contraseña -->
                <div>
                  <label
                    for="confirmPassword"
                    class="block text-amber-100 text-sm font-medium mb-2"
                  >
                    Confirmar Contraseña
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input
                      id="confirmPassword"
                      [type]="showConfirmPassword ? 'text' : 'password'"
                      formControlName="confirmPassword"
                      autocomplete="new-password"
                      class="w-full pl-10 pr-12 py-3 bg-stone-800/50 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                      placeholder="Repite la contraseña"
                      [class.border-red-500]="
                        restablecerPasswordForm.get('confirmPassword')?.invalid &&
                        restablecerPasswordForm.get('confirmPassword')?.touched
                      "
                    />
                    <button
                      type="button"
                      (click)="toggleConfirmPassword()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-400 transition-colors"
                    >
                      <i [class]="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  @if (restablecerPasswordForm.get('confirmPassword')?.touched) {
                    @if (restablecerPasswordForm.get('confirmPassword')?.hasError('required')) {
                      <p class="mt-2 text-red-400 text-sm">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        Por favor confirma tu contraseña
                      </p>
                    } @else if (restablecerPasswordForm.hasError('passwordMismatch')) {
                      <p class="mt-2 text-red-400 text-sm">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        Las contraseñas no coinciden
                      </p>
                    }
                  }
                </div>

                <!-- Indicador de fortaleza -->
                @if (restablecerPasswordForm.get('password')?.value) {
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-amber-200/70">Fortaleza de la contraseña:</span>
                      <span [class]="getPasswordStrengthClass()">
                        {{ getPasswordStrength() }}
                      </span>
                    </div>
                    <div class="w-full bg-stone-800/50 rounded-full h-2 overflow-hidden">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        [style.width.%]="getPasswordStrengthPercentage()"
                        [class]="getPasswordStrengthBarClass()"
                      ></div>
                    </div>
                  </div>
                }

                <!-- Mensaje de error -->
                @if (error) {
                  <div
                    class="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm flex items-center gap-3"
                  >
                    <i class="fas fa-exclamation-circle text-red-400"></i>
                    <span>{{ error }}</span>
                  </div>
                }

                <!-- Botón submit -->
                <button
                  type="submit"
                  [disabled]="restablecerPasswordForm.invalid || loading"
                  class="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  @if (loading) {
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Actualizando...</span>
                  } @else {
                    <i class="fas fa-check"></i>
                    <span>Actualizar contraseña</span>
                  }
                </button>
              </div>
            </form>
          }
        </div>

        <!-- Volver al inicio -->
        <div class="mt-6 text-center">
          <a
            routerLink="/"
            class="text-amber-200/60 hover:text-amber-200 text-sm transition-colors inline-flex items-center gap-2"
          >
            <i class="fas fa-home"></i>
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  `,
})
export class RestablecerPasswordComponent implements OnInit {
  restablecerPasswordForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  invalidToken = false;
  token = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.restablecerPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    // Obtener token de la URL
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.invalidToken = true;
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(): string {
    const password = this.restablecerPasswordForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);

    if (strength < 30) return 'Débil';
    if (strength < 60) return 'Media';
    if (strength < 80) return 'Fuerte';
    return 'Muy fuerte';
  }

  getPasswordStrengthClass(): string {
    const password = this.restablecerPasswordForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);

    if (strength < 30) return 'text-red-400 font-semibold';
    if (strength < 60) return 'text-yellow-400 font-semibold';
    if (strength < 80) return 'text-blue-400 font-semibold';
    return 'text-green-400 font-semibold';
  }

  getPasswordStrengthBarClass(): string {
    const password = this.restablecerPasswordForm.get('password')?.value || '';
    const strength = this.calculatePasswordStrength(password);

    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getPasswordStrengthPercentage(): number {
    const password = this.restablecerPasswordForm.get('password')?.value || '';
    return this.calculatePasswordStrength(password);
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    return Math.min(strength, 100);
  }

  onSubmit() {
    if (this.restablecerPasswordForm.invalid || !this.token) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { password } = this.restablecerPasswordForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.invalidToken = true;
        } else {
          this.error =
            err.error?.message || 'Error al restablecer la contraseña. Por favor intenta de nuevo.';
        }
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
