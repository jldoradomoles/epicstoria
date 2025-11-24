import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
})
export class EventCards implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  events: Event[] = [];

  readonly defaultImage = 'https://placehold.co/600x400/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  // Hacer las funciones disponibles en el template
  getCategoryColor = getCategoryColor;
  getPlainText = getPlainText;

  ngOnInit() {
    console.log('Loading events from data/events.json');
    this.http.get<Event[]>('data/events.json').subscribe({
      next: async (data) => {
        console.log('Events loaded successfully:', data);
        // Procesar las URLs de imágenes para asegurar formatos correctos
        this.events = await this.processEventImages(data);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  private async processEventImages(events: Event[]): Promise<Event[]> {
    // Si quieres procesar automáticamente todas las imágenes al cargar,
    // descomenta el código siguiente. Por ahora se maneja bajo demanda con onImageError.

    /*
    const processedEvents = await Promise.all(
      events.map(async (event) => {
        if (event.imageUrl && !event.imageUrl.includes('.')) {
          // Si no tiene extensión, buscar automáticamente
          try {
            const workingUrl = await tryLoadImageFormats(event.imageUrl);
            return { ...event, imageUrl: workingUrl };
          } catch {
            return event;
          }
        }
        return event;
      })
    );
    return processedEvents;
    */

    return events;
  }

  async onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    await handleImageError(event, imgElement.src, this.defaultImage);
  }
}
