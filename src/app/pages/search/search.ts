import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Event } from '../../models/event.model';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { EventApiService } from '../../services/event-api.service';
import { getCategoryColor } from '../../utils/category.utils';

@Component({
  selector: 'app-search',
  imports: [RouterLink, FormsModule, DateFormatPipe],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  private eventApiService = inject(EventApiService);

  events: Event[] = [];
  filteredEvents: Event[] = [];

  searchName: string = '';
  searchDate: string = '';
  searchContent: string = '';

  selectedCategory: string = 'all';
  categories: string[] = [];

  getCategoryColor = getCategoryColor;

  ngOnInit() {
    this.eventApiService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        // No mostrar eventos hasta que el usuario realice una búsqueda
        this.filteredEvents = [];
        this.extractCategories();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  extractCategories() {
    const categorySet = new Set(this.events.map((e) => e.category));
    this.categories = Array.from(categorySet).sort();
  }

  applyFilters() {
    this.filteredEvents = this.events.filter((event) => {
      // Filtro por nombre
      const matchesName =
        this.searchName.trim() === '' ||
        event.title.toLowerCase().includes(this.searchName.toLowerCase());

      // Filtro por fecha
      const matchesDate = this.searchDate.trim() === '' || event.date.includes(this.searchDate);

      // Filtro por contenido (busca en summary, context, consequences)
      const summary = Array.isArray(event.summary) ? event.summary.join(' ') : event.summary;
      const context = Array.isArray(event.context) ? event.context.join(' ') : event.context;
      const consequences = Array.isArray(event.consequences)
        ? event.consequences.join(' ')
        : event.consequences;

      const matchesContent =
        this.searchContent.trim() === '' ||
        summary.toLowerCase().includes(this.searchContent.toLowerCase()) ||
        context.toLowerCase().includes(this.searchContent.toLowerCase()) ||
        consequences.toLowerCase().includes(this.searchContent.toLowerCase());

      // Filtro por categoría
      const matchesCategory =
        this.selectedCategory === 'all' || event.category === this.selectedCategory;

      return matchesName && matchesDate && matchesContent && matchesCategory;
    });
  }

  clearFilters() {
    this.searchName = '';
    this.searchDate = '';
    this.searchContent = '';
    this.selectedCategory = 'all';
    // Al limpiar filtros, no mostrar eventos hasta nueva búsqueda
    this.filteredEvents = [];
  }
}
