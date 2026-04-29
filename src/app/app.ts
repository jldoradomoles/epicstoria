import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { AuthService } from './services/auth.service';
import { EventApiService } from './services/event-api.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('epicstoria');
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private eventApiService = inject(EventApiService);
  private platformId = inject(PLATFORM_ID);
  private currentUrl = signal<string>('');

  // Rutas donde no se muestra el header/footer
  private authRoutes = ['/login', '/register'];

  showHeaderFooter = computed(() => {
    return !this.authRoutes.includes(this.currentUrl());
  });

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.eventApiService.getAllEvents().subscribe((events) => {
        console.log(
          `%c📋 Eventos en BD (${events.length} total)`,
          'font-size:14px;font-weight:bold;color:#6366f1',
        );
        console.table(
          events.map((e) => ({
            id: e.id,
            slug: e.slug,
            titulo: e.title,
            fecha: e.date,
            categoria: e.category,
          })),
        );
      });
    }

    // Iniciar polling de notificaciones si el usuario está autenticado
    if (this.authService.currentUser()) {
      this.notificationService.startPolling();
    }

    // Escuchar cambios en el estado de autenticación
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.notificationService.startPolling();
      } else {
        this.notificationService.stopPolling();
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }
}
