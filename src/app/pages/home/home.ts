import { Component } from '@angular/core';
import { EventCards } from '../../components/event-cards/event-cards';
import { FeatureCards } from '../../components/feature-cards/feature-cards';
import { Hero } from '../../components/hero/hero';
import { InfoSection } from '../../components/info-section/info-section';

@Component({
  selector: 'app-home',
  imports: [Hero, InfoSection, FeatureCards, EventCards],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
