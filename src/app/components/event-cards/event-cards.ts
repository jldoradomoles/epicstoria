import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { getCategoryColor } from '../../utils/category.utils';
import { handleImageError } from '../../utils/image.utils';
import { getPlainText } from '../../utils/text.utils';

@Component({
  selector: 'app-event-cards',
  imports: [RouterLink, DateFormatPipe, NgClass],
  templateUrl: './event-cards.html',
  styleUrl: './event-cards.scss',
  host: { '(window:resize)': 'onResize()' },
})
export class EventCards implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  // Input de eventos desde el componente padre
  events = input<Event[]>([]);

  // Input para reiniciar la paginación
  resetTrigger = input<number>(0);

  // Número de eventos a mostrar
  eventsToShow = signal<number>(6);
  isMobile = false;

  readonly defaultImage = 'https://placehold.co/600x400/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  // Hacer las funciones disponibles en el template
  getCategoryColor = getCategoryColor;
  getPlainText = getPlainText;

  constructor() {
    // Efecto para reiniciar la paginación cuando cambie el trigger
    effect(() => {
      // Observar el trigger
      this.resetTrigger();
      // Reiniciar el contador de eventos
      this.eventsToShow.set(6);
    });
  }

  // Getter para obtener los eventos a mostrar según la paginación
  get displayedEvents(): Event[] {
    return this.events().slice(0, this.eventsToShow());
  }

  // Verificar si hay más eventos para mostrar
  get hasMoreEvents(): boolean {
    return this.events().length > this.eventsToShow();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  // Cargar más eventos (6 adicionales)
  loadMoreEvents() {
    this.eventsToShow.update((current) => current + 6);
    this.cdr.markForCheck();
  }

  async onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    await handleImageError(event, imgElement.src, this.defaultImage);
  }

  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;
    }
  }
}
