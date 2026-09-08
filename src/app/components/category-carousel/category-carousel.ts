import { Component, output } from '@angular/core';

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
  categorySelected = output<string>();

  readonly categories: CategoryCard[] = [
    { name: 'Personajes históricos', imageUrl: '/images/categorias/personajes-historicos.webp' },
    { name: 'Rincón histórico', imageUrl: '/images/categorias/rincon-historico.webp' },
    { name: 'Monumentos', imageUrl: '/images/categorias/monumentos.webp' },
    { name: 'Catástrofes', imageUrl: '/images/categorias/catastrofes.webp' },
    { name: 'Mitología', imageUrl: '/images/categorias/mitologia.webp' },
    { name: 'Descubrimientos', imageUrl: '/images/categorias/descubrimientos.webp' },
    { name: 'Espacio', imageUrl: '/images/categorias/espacio.webp' },
    { name: 'Artefactos históricos', imageUrl: '/images/categorias/artefactos-historicos.webp' },
  ];

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
