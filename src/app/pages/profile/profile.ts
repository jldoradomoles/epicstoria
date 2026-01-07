import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserRole } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { EventApiService } from '../../services/event-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
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
  adminSuccessMessage = signal<string>('');
  adminErrorMessage = signal<string>('');

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  activeTab = signal<'profile' | 'password' | 'admin'>('profile');

  // Admin upload state
  selectedFile = signal<File | null>(null);
  isUploading = signal<boolean>(false);
  uploadResult = signal<{ created: number; updated: number; errors: string[] } | null>(null);

  categories = ['Espacio', 'Historia', 'Ciencia', 'Arte', 'Tecnología', 'Naturaleza', 'Mitología'];

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private eventApiService: EventApiService,
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

  setActiveTab(tab: 'profile' | 'password' | 'admin'): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');
    this.adminSuccessMessage.set('');
    this.adminErrorMessage.set('');
    this.uploadResult.set(null);
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
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

  // Admin methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedTypes.includes(file.type)) {
        this.adminErrorMessage.set('Solo se permiten archivos Excel (.xlsx, .xls)');
        this.selectedFile.set(null);
        return;
      }

      this.selectedFile.set(file);
      this.adminErrorMessage.set('');
    }
  }

  onUploadExcel(): void {
    const file = this.selectedFile();
    if (!file) {
      this.adminErrorMessage.set('Por favor selecciona un archivo Excel');
      return;
    }

    this.isUploading.set(true);
    this.adminSuccessMessage.set('');
    this.adminErrorMessage.set('');
    this.uploadResult.set(null);

    this.eventApiService.uploadEventsExcel(file).subscribe({
      next: (result) => {
        this.uploadResult.set(result);
        this.adminSuccessMessage.set(
          `Proceso completado: ${result.created} eventos creados, ${result.updated} actualizados`,
        );
        this.selectedFile.set(null);
        this.isUploading.set(false);

        // Reset file input
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Error al procesar el archivo Excel';
        this.adminErrorMessage.set(message);
        this.isUploading.set(false);
      },
    });
  }
}
