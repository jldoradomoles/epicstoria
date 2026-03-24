import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryCarousel } from '../../components/category-carousel/category-carousel';
import { EventCards } from '../../components/event-cards/event-cards';
import { EventFilters, type FilterValues } from '../../components/event-filters/event-filters';
import { Hero } from '../../components/hero/hero';
import { Event } from '../../models/event.model';
import { EventApiService } from '../../services/event-api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-eventos',
  imports: [EventCards, Hero, CategoryCarousel, EventFilters],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class Eventos implements OnInit {
  private seo = inject(SeoService);
  private eventApiService = inject(EventApiService);

  // Estado de búsqueda y filtrado
  searchName = signal<string>('');
  searchContent = signal<string>('');
  selectedCategory = signal<string>('all');
  categories = signal<string[]>([]);

  // Eventos
  allEvents = signal<Event[]>([]);
  filteredEvents = signal<Event[]>([]);

  ngOnInit() {
    this.seo.updateMetaTags({
      title: 'Eventos Históricos',
      description:
        'Descubre y explora una colección completa de eventos históricos fascinantes. Desde batallas épicas hasta descubrimientos científicos revolucionarios.',
      keywords:
        'eventos históricos, historia mundial, cronología histórica, hechos históricos, cultura, ciencia, guerras, descubrimientos',
      url: 'https://epicstoria.es/eventos',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.es/eventos');

    // Cargar todos los eventos
    this.eventApiService.getAllEvents().subscribe({
      next: (events) => {
        // Ordenar por fecha más reciente primero
        const sortedEvents = [...events].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        this.allEvents.set(sortedEvents);
        // Por defecto mostrar todos los eventos (la paginación mostrará los 6 primeros)
        this.filteredEvents.set(sortedEvents);
        // Extraer categorías después de cargar los eventos
        this.extractCategories();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  onFiltersApplied(filters: FilterValues) {
    this.searchName.set(filters.searchName);
    this.searchContent.set(filters.searchContent);
    this.selectedCategory.set(filters.selectedCategory);

    let filtered = this.allEvents();

    // Filtro por nombre
    const nameQuery = filters.searchName.trim().toLowerCase();
    if (nameQuery) {
      filtered = filtered.filter((event) => event.title.toLowerCase().includes(nameQuery));
    }

    // Filtro por contenido
    const contentQuery = filters.searchContent.trim().toLowerCase();
    if (contentQuery) {
      filtered = filtered.filter((event) => {
        const summary = Array.isArray(event.summary) ? event.summary.join(' ') : event.summary;
        const context = Array.isArray(event.context) ? event.context.join(' ') : event.context;
        const consequences = Array.isArray(event.consequences)
          ? event.consequences.join(' ')
          : event.consequences;

        return (
          summary.toLowerCase().includes(contentQuery) ||
          context.toLowerCase().includes(contentQuery) ||
          consequences.toLowerCase().includes(contentQuery)
        );
      });
    }

    // Filtro por categoría
    if (filters.selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === filters.selectedCategory);
    }

    this.filteredEvents.set(filtered);
    // Reiniciar la paginación al aplicar filtros
    this.resetPagination();
  }

  onFiltersCleared() {
    this.searchName.set('');
    this.searchContent.set('');
    this.selectedCategory.set('all');
    // Volver a mostrar todos los eventos (la paginación mostrará los 6 primeros)
    this.filteredEvents.set(this.allEvents());
    this.resetPagination();
  }

  onCategorySelected(category: string) {
    this.selectedCategory.set(category);
    // Filtrar eventos por la categoría seleccionada
    const filtered = this.allEvents().filter((event) => event.category === category);
    this.filteredEvents.set(filtered);
    // Reiniciar la paginación al seleccionar categoría
    this.resetPagination();
  }

  // Método para reiniciar la paginación (será llamado por el componente hijo)
  private resetPagination() {
    // Emitir un evento o usar un signal para reiniciar la paginación
    // Por ahora, lo haremos mediante una señal
    this.paginationReset.set(Date.now());
  }

  extractCategories() {
    const categorySet = new Set(this.allEvents().map((e) => e.category));
    this.categories.set(Array.from(categorySet).sort());
  }

  // Signal para indicar cuándo reiniciar la paginación
  paginationReset = signal<number>(0);
}
