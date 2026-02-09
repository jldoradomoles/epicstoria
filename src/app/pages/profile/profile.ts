import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { UsersList } from '../../components/users-list/users-list';
import { Friend, UserRole } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { EventApiService } from '../../services/event-api.service';
import { FriendshipService } from '../../services/friendship.service';
import { PointsService } from '../../services/points.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, UsersList],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
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
  activeTab = signal<'profile' | 'password' | 'friends' | 'admin'>('profile');

  // Friends state
  friends = signal<Friend[]>([]);
  isLoadingFriends = signal<boolean>(false);
  unreadMessages = signal<{ [userId: number]: number }>({});

  // Subscription
  private friendsSubscription?: Subscription;
  private unreadMessagesSubscription?: Subscription;

  // Admin upload state
  selectedFile = signal<File | null>(null);
  isUploading = signal<boolean>(false);
  uploadResult = signal<{ created: number; updated: number; errors: string[] } | null>(null);

  // Admin image upload state
  selectedImages = signal<File[]>([]);
  isUploadingImages = signal<boolean>(false);
  imageUploadResult = signal<Array<{
    filename: string;
    imageUrl: string;
    originalName: string;
    size: number;
  }> | null>(null);
  imageSuccessMessage = signal<string>('');
  imageErrorMessage = signal<string>('');

  categories = ['Espacio', 'Historia', 'Ciencia', 'Arte', 'Tecnología', 'Naturaleza', 'Mitología'];

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private eventApiService: EventApiService,
    private pointsService: PointsService,
    private friendshipService: FriendshipService,
    private chatService: ChatService,
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

    // Suscribirse a cambios en la lista de amigos
    this.friendsSubscription = this.friendshipService.friendsChanged$.subscribe(() => {
      // Recargar la lista de amigos automáticamente sin verificar isLoading
      this.friendshipService.getFriends().subscribe({
        next: (friends) => {
          this.friends.set(friends);
        },
        error: (error) => {
          console.error('Error al cargar amigos:', error);
        },
      });
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción
    this.friendsSubscription?.unsubscribe();
    this.unreadMessagesSubscription?.unsubscribe();
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

  setActiveTab(tab: 'profile' | 'password' | 'friends' | 'admin'): void {
    this.activeTab.set(tab);
    this.clearMessages();

    if (tab === 'friends') {
      this.loadFriends();
      this.loadUnreadMessages();
      this.startUnreadMessagesPolling();
    } else {
      this.stopUnreadMessagesPolling();
    }
  }

  loadFriends(): void {
    this.isLoadingFriends.set(true);
    this.friendshipService.getFriends().subscribe({
      next: (friends) => {
        this.friends.set(friends);
        this.isLoadingFriends.set(false);
      },
      error: (error) => {
        console.error('Error al cargar amigos:', error);
        this.isLoadingFriends.set(false);
      },
    });
  }

  loadUnreadMessages(): void {
    if (!this.authService.currentUser()) {
      return;
    }

    this.chatService.getUnreadCountByUser().subscribe({
      next: (unreadByUser) => {
        this.unreadMessages.set(unreadByUser);
      },
      error: (error) => {
        console.error('Error al cargar mensajes sin leer:', error);
      },
    });
  }

  startUnreadMessagesPolling(): void {
    // Actualizar contadores cada 5 segundos
    this.unreadMessagesSubscription = interval(5000).subscribe(() => {
      this.loadUnreadMessages();
    });
  }

  stopUnreadMessagesPolling(): void {
    if (this.unreadMessagesSubscription) {
      this.unreadMessagesSubscription.unsubscribe();
      this.unreadMessagesSubscription = undefined;
    }
  }

  getUnreadCount(userId: number): number {
    return this.unreadMessages()[userId] || 0;
  }

  clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');
    this.adminSuccessMessage.set('');
    this.adminErrorMessage.set('');
    this.uploadResult.set(null);
    this.imageSuccessMessage.set('');
    this.imageErrorMessage.set('');
    this.imageUploadResult.set(null);
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
    console.log(file);

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

  // Admin image methods
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Formato no permitido`);
        } else if (file.size > maxSize) {
          errors.push(`${file.name}: Tamaño máximo 5MB`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        this.imageErrorMessage.set(errors.join(', '));
      } else {
        this.imageErrorMessage.set('');
      }

      this.selectedImages.set(validFiles);
    }
  }

  onUploadImages(): void {
    const files = this.selectedImages();

    if (files.length === 0) {
      this.imageErrorMessage.set('Por favor selecciona al menos una imagen');
      return;
    }

    this.isUploadingImages.set(true);
    this.imageSuccessMessage.set('');
    this.imageErrorMessage.set('');
    this.imageUploadResult.set(null);

    // Si es una sola imagen
    if (files.length === 1) {
      this.eventApiService.uploadEventImage(files[0]).subscribe({
        next: (result) => {
          this.imageUploadResult.set([result]);
          this.imageSuccessMessage.set(`Imagen subida exitosamente: ${result.imageUrl}`);
          this.selectedImages.set([]);
          this.isUploadingImages.set(false);

          // Reset file input
          const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (error) => {
          const message = error.error?.message || 'Error al subir la imagen';
          this.imageErrorMessage.set(message);
          this.isUploadingImages.set(false);
        },
      });
    } else {
      // Múltiples imágenes
      this.eventApiService.uploadEventImages(files).subscribe({
        next: (results) => {
          this.imageUploadResult.set(results);
          this.imageSuccessMessage.set(`${results.length} imágenes subidas exitosamente`);
          this.selectedImages.set([]);
          this.isUploadingImages.set(false);

          // Reset file input
          const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (error) => {
          const message = error.error?.message || 'Error al subir las imágenes';
          this.imageErrorMessage.set(message);
          this.isUploadingImages.set(false);
        },
      });
    }
  }

  removeImage(index: number): void {
    const currentImages = this.selectedImages();
    currentImages.splice(index, 1);
    this.selectedImages.set([...currentImages]);

    if (currentImages.length === 0) {
      const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.imageSuccessMessage.set('URL copiada al portapapeles');
      setTimeout(() => {
        this.imageSuccessMessage.set('');
      }, 2000);
    });
  }

  // Métodos para el sistema de puntos
  getStarsCount(): number {
    const user = this.authService.currentUser();
    return user ? this.pointsService.calculateStars(user.points || 0) : 0;
  }

  getStarsArray(): number[] {
    const user = this.authService.currentUser();
    return user ? this.pointsService.getStarsArray(user.points || 0) : [];
  }

  getPointsToNextStar(): number {
    const user = this.authService.currentUser();
    return user ? this.pointsService.getPointsToNextStar(user.points || 0) : 100;
  }

  getProgressToNextStar(): number {
    const user = this.authService.currentUser();
    if (!user) return 0;
    const currentPoints = user.points || 0;
    const pointsInCurrentLevel = currentPoints % 100;
    return pointsInCurrentLevel;
  }
}
