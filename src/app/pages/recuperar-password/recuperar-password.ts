import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-password',
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
          <p class="mt-2 text-amber-200/70">Recupera tu contraseña</p>
        </div>

        <!-- Card del formulario -->
        <div class="container-custom rounded-xl p-8">
          @if (emailSent) {
            <!-- Mensaje de éxito -->
            <div class="text-center space-y-4">
              <div class="text-6xl">📧</div>
              <h3 class="text-2xl font-bold text-amber-100">¡Email enviado!</h3>
              <p class="text-amber-200/80">
                Si existe una cuenta con el email
                <strong class="text-amber-100">{{
                  recuperarPasswordForm.get('email')?.value
                }}</strong
                >, recibirás instrucciones para recuperar tu contraseña.
              </p>
              <p class="text-sm text-amber-200/60">
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              <button
                (click)="goToLogin()"
                class="w-full mt-6 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                Volver al inicio de sesión
              </button>
            </div>
          } @else {
            <!-- Formulario -->
            <form [formGroup]="recuperarPasswordForm" (ngSubmit)="onSubmit()">
              <div class="space-y-6">
                <!-- Mensaje de información -->
                <div class="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <i class="fas fa-info-circle text-amber-400 mt-0.5"></i>
                    <p class="text-amber-200/80 text-sm">
                      Te enviaremos un enlace a tu correo electrónico para que puedas restablecer tu
                      contraseña.
                    </p>
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-amber-100 text-sm font-medium mb-2">
                    Correo electrónico
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      autocomplete="email"
                      class="w-full pl-10 pr-4 py-3 bg-stone-800/50 border border-amber-900/30 rounded-lg text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                      placeholder="tu@email.com"
                      [class.border-red-500]="
                        recuperarPasswordForm.get('email')?.invalid &&
                        recuperarPasswordForm.get('email')?.touched
                      "
                    />
                  </div>
                  @if (
                    recuperarPasswordForm.get('email')?.invalid &&
                    recuperarPasswordForm.get('email')?.touched
                  ) {
                    <p class="mt-2 text-red-400 text-sm">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      Por favor ingresa un email válido
                    </p>
                  }
                </div>

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
                  [disabled]="recuperarPasswordForm.invalid || loading"
                  class="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  @if (loading) {
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Enviando...</span>
                  } @else {
                    <i class="fas fa-paper-plane"></i>
                    <span>Enviar instrucciones</span>
                  }
                </button>

                <!-- Volver al login -->
                <div class="text-center pt-2">
                  <a
                    routerLink="/login"
                    class="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <i class="fas fa-arrow-left"></i>
                    Volver al inicio de sesión
                  </a>
                </div>
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
export class RecuperarPasswordComponent {
  recuperarPasswordForm: FormGroup;
  loading = false;
  error = '';
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.recuperarPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.recuperarPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { email } = this.recuperarPasswordForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al enviar el email. Por favor intenta de nuevo.';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
