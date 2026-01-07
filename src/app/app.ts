import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('epicstoria');
  private router = inject(Router);
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
}
