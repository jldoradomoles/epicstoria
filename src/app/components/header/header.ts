import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  readonly useStaticData = environment.useStaticData;
  mobileMenuOpen = false;
  unreadCount = signal<number>(0);

  private unreadSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // Suscribirse al contador de mensajes sin leer
    this.unreadSubscription = this.notificationService.newMessage$.subscribe((count) => {
      this.unreadCount.set(count);
    });

    // Obtener el contador actual
    const currentCount = this.notificationService.getCurrentUnreadCount();
    this.unreadCount.set(currentCount);
  }

  ngOnDestroy(): void {
    this.unreadSubscription?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  getInitials(): string {
    const user = this.currentUser;
    if (!user) return '?';
    const firstInitial = user.name?.charAt(0) || '';
    const lastInitial = user.lastname?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || '?';
  }

  logout(): void {
    this.authService.logout();
  }
}
