import { Component } from '@angular/core';
import { EventCards } from '../../components/event-cards/event-cards';
import { Hero } from '../../components/hero/hero';

@Component({
  selector: 'app-eventos',
  imports: [EventCards, Hero],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class Eventos {}
