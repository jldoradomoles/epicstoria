import { Component, inject, OnInit } from '@angular/core';
import { FeatureCards } from '../../components/feature-cards/feature-cards';
import { Hero } from '../../components/hero/hero';
import { InfoSection } from '../../components/info-section/info-section';
import { SocialMedia } from '../../components/social-media/social-media';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  imports: [Hero, InfoSection, FeatureCards, SocialMedia],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateMetaTags({
      title: 'Inicio',
      description:
        'Explora eventos históricos fascinantes, resuelve quizzes educativos y aprende historia de manera divertida. Desde el espacio hasta la mitología antigua.',
      keywords:
        'historia, eventos históricos, educación, quiz historia, cultura, ciencia, arte, mitología, tecnología',
      url: 'https://epicstoria.com',
      type: 'website',
    });

    this.seo.updateCanonicalUrl('https://epicstoria.com');
  }
}
