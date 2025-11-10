import { Routes } from '@angular/router';
import { EventDetail } from './pages/event-detail/event-detail';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'evento/:id',
    component: EventDetail,
  },
];
