import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private platformId = inject(PLATFORM_ID);

  imageUrl = input<string>('');
  noMainImage = input<boolean>(false);
  mobileImageUrl = input<string>('');

  private readonly defaultImage = '/images/Cabecera.jpg';
  private readonly defaultMobileImage = '/images/home-movil.jpg';

  isMobile = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkIfMobile();
      window.addEventListener('resize', () => this.checkIfMobile());
    }
  }

  private checkIfMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

  backgroundImageUrl = computed(() => {
    const isM = this.isMobile();
    const customImage = this.imageUrl();
    const customMobileImage = this.mobileImageUrl();
    if (customImage) {
      return isM && customMobileImage ? customMobileImage : customImage;
    }
    return isM ? customMobileImage || this.defaultMobileImage : this.defaultImage;
  });

}
