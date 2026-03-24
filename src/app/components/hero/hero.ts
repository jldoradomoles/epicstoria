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

  // Input opcional para la imagen de fondo (desktop)
  noMainImage = input<boolean>(false);

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
    const customImage = this.imageUrl();
    const customMobileImage = this.mobileImageUrl();

    // Si hay una imagen personalizada, usarla en todas las resoluciones
    if (customImage) {
      // Solo usar imagen móvil personalizada si está definida
      return isM && customMobileImage ? customMobileImage : customImage;
    }

    // Sin imagen personalizada (home): usar imágenes por defecto
    if (isM) {
      return customMobileImage || this.defaultMobileImage;
    } else {
      return this.defaultImage;
    }
  });
}
