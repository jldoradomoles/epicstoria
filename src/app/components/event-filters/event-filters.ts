import { Component, input, output, signal } from '@angular/core';

export interface FilterValues {
  searchName: string;
  searchContent: string;
  selectedCategory: string;
}

@Component({
  selector: 'app-event-filters',
  imports: [],
  templateUrl: './event-filters.html',
  styleUrl: './event-filters.scss',
})
export class EventFilters {
  // Input de categorías disponibles
  categories = input.required<string[]>();

  // Outputs para emitir acciones de filtrado
  filtersApplied = output<FilterValues>();
  filtersCleared = output<void>();

  // Estado interno de los filtros
  searchName = signal<string>('');
  searchContent = signal<string>('');
  selectedCategory = signal<string>('all');

  applyFilters() {
    this.filtersApplied.emit({
      searchName: this.searchName(),
      searchContent: this.searchContent(),
      selectedCategory: this.selectedCategory(),
    });
  }

  clearFilters() {
    this.searchName.set('');
    this.searchContent.set('');
    this.selectedCategory.set('all');
    this.filtersCleared.emit();
  }
}
