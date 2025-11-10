import { Component } from '@angular/core';
import { EventCards } from '../../components/event-cards/event-cards';
import { Hero } from '../../components/hero/hero';

@Component({
  selector: 'app-home',
  imports: [Hero, EventCards],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
