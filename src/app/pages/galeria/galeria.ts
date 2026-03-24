import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Hero } from '../../components/hero/hero';
import { Event } from '../../models/event.model';
import { EventApiService } from '../../services/event-api.service';
import { SeoService } from '../../services/seo.service';

interface EventCard {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  imageCount: number;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [RouterModule, Hero],
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss',
})
export class Galeria implements OnInit {
  private eventApiService = inject(EventApiService);
  private seo = inject(SeoService);
  private router = inject(Router);

  events = signal<EventCard[]>([]);
  displayedEvents = signal<EventCard[]>([]);
  isLoading = signal<boolean>(true);
  eventsPerPage = 6;
  currentPage = signal<number>(0);

  ngOnInit(): void {
    this.seo.updateMetaTags({
      title: 'Galería de Eventos Históricos',
      description:
        'Explora una colección visual de eventos históricos. Descubre imágenes y momentos que marcaron la historia.',
      keywords: 'galería histórica, eventos históricos, fotografías históricas, archivo visual',
      url: 'https://epicstoria.es/galeria',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.es/galeria');

    this.loadEvents();
  }

  loadEvents() {
    this.eventApiService.getAllEvents().subscribe({
      next: (events: Event[]) => {
        // Filtrar eventos que tengan al menos una imagen
        const eventCards: EventCard[] = events
          .filter((event) => event.imageUrl)
          .map((event) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            category: event.category,
            imageUrl: event.imageUrl,
            imageCount: 1 + (event.additionalImages?.length || 0),
          }));

        this.events.set(eventCards);
        this.loadMoreEvents();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadMoreEvents() {
    const currentDisplayed = this.displayedEvents().length;
    const totalEvents = this.events().length;

    if (currentDisplayed < totalEvents) {
      const nextPageEnd = Math.min(currentDisplayed + this.eventsPerPage, totalEvents);
      const newDisplayed = this.events().slice(0, nextPageEnd);
      this.displayedEvents.set(newDisplayed);
      this.currentPage.update((p) => p + 1);
    }
  }

  hasMoreEvents(): boolean {
    return this.displayedEvents().length < this.events().length;
  }

  viewEventGallery(eventId: string) {
    this.router.navigate(['/galeria/evento', eventId]);
  }
}
