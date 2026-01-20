import { Component } from '@angular/core';
import { EventCards } from '../../components/event-cards/event-cards';
import { FeatureCards } from '../../components/feature-cards/feature-cards';
import { Hero } from '../../components/hero/hero';
import { InfoSection } from '../../components/info-section/info-section';
import { SocialMedia } from '../../components/social-media/social-media';

@Component({
  selector: 'app-home',
  imports: [Hero, InfoSection, FeatureCards, SocialMedia, EventCards],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
