import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, input, PLATFORM_ID, signal } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  private platformId = inject(PLATFORM_ID);

  // Input para la imagen de fondo (desktop)
  imageUrl = input<string>('');

  // Input opcional para la imagen móvil
  mobileImageUrl = input<string>('');

  // Imagen por defecto para desktop
  private readonly defaultImage = '/images/Cabecera1.jpg';

  // Imagen por defecto para móvil
  private readonly defaultMobileImage = '/images/home-movil.jpg';

  // Señal para saber si es móvil
  isMobile = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Detectar si es móvil al iniciar
      this.checkIfMobile();

      // Escuchar cambios en el tamaño de la ventana
      window.addEventListener('resize', () => this.checkIfMobile());
    }
  }

  private checkIfMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

  // URL de imagen final que cambia según el dispositivo
  backgroundImageUrl = computed(() => {
    const isM = this.isMobile();

    if (isM) {
      // En móvil, usar la imagen móvil si está disponible, sino la por defecto
      return this.mobileImageUrl() || this.defaultMobileImage;
    } else {
      // En desktop, usar la imagen principal o la por defecto
      return this.imageUrl() || this.defaultImage;
    }
  });
}
