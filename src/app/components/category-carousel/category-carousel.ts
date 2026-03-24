import { Component, computed, input, output } from '@angular/core';

interface CategoryCard {
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-category-carousel',
  imports: [],
  templateUrl: './category-carousel.html',
  styleUrl: './category-carousel.scss',
})
export class CategoryCarousel {
  // Input de categorías disponibles
  categoryNames = input.required<string[]>();

  // Output para emitir la categoría seleccionada
  categorySelected = output<string>();

  // Computed para convertir nombres de categorías en CategoryCard[]
  categories = computed<CategoryCard[]>(() => {
    return this.categoryNames().map((name) => ({
      name,
      imageUrl: `/images/categorias/${this.normalizeImageName(name)}.jpg`,
    }));
  });

  private normalizeImageName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
  }

  selectCategory(category: string) {
    this.categorySelected.emit(category);
  }

  scrollLeft() {
    const container = document.querySelector('.category-scroll-container');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    const container = document.querySelector('.category-scroll-container');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}
