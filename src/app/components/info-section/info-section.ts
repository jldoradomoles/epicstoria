import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-info-section',
  imports: [],
  templateUrl: './info-section.html',
  styleUrl: './info-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoSection {
  private el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          }),
        { threshold: 0.35, rootMargin: '0px 0px -18% 0px' }
      );
      this.el.nativeElement
        .querySelectorAll('[data-reveal]')
        .forEach((el: Element) => observer.observe(el));
    });
  }
}
