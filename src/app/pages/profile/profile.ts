import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Header, Footer],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  passwordSuccessMessage = signal<string>('');
  passwordErrorMessage = signal<string>('');

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  activeTab = signal<'profile' | 'password'>('profile');

  categories = ['Espacio', 'Historia', 'Ciencia', 'Arte', 'Tecnología', 'Naturaleza', 'Mitología'];

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: [''],
      bio: [''],
      favorite_category: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmNewPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  get isLoading() {
    return this.authService.isLoading();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;

    if (newPassword !== confirmNewPassword) {
      form.get('confirmNewPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  loadProfile(): void {
    const user = this.currentUser;
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        lastname: user.lastname || '',
        bio: user.bio || '',
        favorite_category: user.favorite_category || '',
      });
    }
  }

  setActiveTab(tab: 'profile' | 'password'): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.clearMessages();

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.successMessage.set('Perfil actualizado correctamente');
      },
      error: (error) => {
        const message = error.error?.message || 'Error al actualizar el perfil';
        this.errorMessage.set(message);
      },
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.clearMessages();

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccessMessage.set('Contraseña cambiada correctamente');
        this.passwordForm.reset();
      },
      error: (error) => {
        const message = error.error?.message || 'Error al cambiar la contraseña';
        this.passwordErrorMessage.set(message);
      },
    });
  }

  getInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';

    const firstInitial = user.name?.charAt(0) || '';
    const lastInitial = user.lastname?.charAt(0) || '';

    return (firstInitial + lastInitial).toUpperCase() || '?';
  }
}
