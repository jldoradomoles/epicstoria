import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-band',
  imports: [RouterLink],
  templateUrl: './hero-band.html',
  styleUrl: './hero-band.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBand implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private el = inject(ElementRef);

  contentInView = signal(false);
  statsInView = signal(false);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.classList.contains('hero-band__content')) {
            this.contentInView.set(true);
          } else if (entry.target.classList.contains('hero-band__stats')) {
            this.statsInView.set(true);
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -290px 0px' },
    );

    const content = this.el.nativeElement.querySelector('.hero-band__content');
    const stats = this.el.nativeElement.querySelector('.hero-band__stats');
    if (content) observer.observe(content);
    if (stats) observer.observe(stats);
  }
}
