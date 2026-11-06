import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-feature-cards',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './feature-cards.html',
  styleUrl: './feature-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureCards {
  private el = inject(ElementRef);
  private zone = inject(NgZone);
  readonly activeCard = signal(0);

  readonly cards = [
    {
      route: '/eventos',
      badge: 'Archivo · Historia',
      title: 'Eventos Históricos',
      description: 'Descubre los acontecimientos más importantes que marcaron la historia de la humanidad.',
      cta: 'Explorar eventos',
      icon: 'images/logos/eventos-historicos.webp',
      iconAlt: 'Icono de Eventos Históricos - Explorar acontecimientos importantes',
    },
    {
      route: '/juegos',
      badge: 'Interactivo · Quiz',
      title: 'Juegos y Quizzes',
      description: 'Pon a prueba tus conocimientos históricos con nuestros divertidos quizzes interactivos.',
      cta: 'Jugar ahora',
      icon: 'images/logos/quiz-interactivo.webp',
      iconAlt: 'Icono de Quiz Interactivo - Pon a prueba tus conocimientos',
    },
    {
      route: '/galeria',
      badge: 'Visual · Arte',
      title: 'Galería Visual',
      description: 'Explora nuestra colección de imágenes históricas y representaciones artísticas.',
      cta: 'Ver galería',
      icon: 'images/logos/galeria-visual.webp',
      iconAlt: 'Icono de Galería Visual - Explora imágenes históricas',
    },
  ];

  constructor() {
    afterNextRender(() => {
      const host = this.el.nativeElement as HTMLElement;
      const section = host.querySelector('.fc-section') as HTMLElement;

      if (!section) return;

      const onScroll = () => {
        const rect = section.getBoundingClientRect();
        const scrollable = section.clientHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
        const index = Math.min(Math.floor(progress * this.cards.length), this.cards.length - 1);
        this.zone.run(() => this.activeCard.set(index));
      };

      window.addEventListener('scroll', onScroll, { passive: true });
    });
  }
}
