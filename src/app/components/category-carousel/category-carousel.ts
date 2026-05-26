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
    { name: 'Personajes históricos', imageUrl: '/images/categorias/personajes-historicos.jpg' },
    { name: 'Rincón histórico', imageUrl: '/images/categorias/rincon-historico.jpg' },
    { name: 'Monumentos', imageUrl: '/images/categorias/monumentos.jpg' },
    { name: 'Catástrofes', imageUrl: '/images/categorias/catastrofes.jpg' },
    { name: 'Mitología', imageUrl: '/images/categorias/mitologia.jpg' },
    { name: 'Descubrimientos', imageUrl: '/images/categorias/descubrimientos.jpg' },
    { name: 'Espacio', imageUrl: '/images/categorias/espacio.jpg' },
    { name: 'Artefactos históricos', imageUrl: '/images/categorias/artefactos-historicos.jpg' },
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
