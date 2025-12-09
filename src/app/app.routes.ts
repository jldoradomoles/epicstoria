import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { EventDetail } from './pages/event-detail/event-detail';
import { Home } from './pages/home/home';
import { Privacy } from './pages/privacy/privacy';
import { Search } from './pages/search/search';
import { Terms } from './pages/terms/terms';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'evento/:id',
    component: EventDetail,
  },
  {
    path: 'buscar',
    component: Search,
  },
  {
    path: 'acerca',
    component: About,
  },
  {
    path: 'terminos',
    component: Terms,
  },
  {
    path: 'privacidad',
    component: Privacy,
  },
];
