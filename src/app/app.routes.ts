import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { About } from './pages/about/about';
import { EventDetail } from './pages/event-detail/event-detail';
import { Eventos } from './pages/eventos/eventos';
import { Galeria } from './pages/galeria/galeria';
import { Home } from './pages/home/home';
import { Juegos } from './pages/juegos/juegos';
import { LoginComponent } from './pages/login/login';
import { Privacy } from './pages/privacy/privacy';
import { ProfileComponent } from './pages/profile/profile';
import { RegisterComponent } from './pages/register/register';
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
    path: 'eventos',
    component: Eventos,
  },
  {
    path: 'juegos',
    component: Juegos,
  },
  {
    path: 'galeria',
    component: Galeria,
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
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
