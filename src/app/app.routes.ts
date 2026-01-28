import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'evento/:id',
    loadComponent: () => import('./pages/event-detail/event-detail').then((m) => m.EventDetail),
  },
  {
    path: 'buscar',
    loadComponent: () => import('./pages/search/search').then((m) => m.Search),
  },
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos').then((m) => m.Eventos),
  },
  {
    path: 'juegos',
    loadComponent: () => import('./pages/juegos/juegos').then((m) => m.Juegos),
  },
  {
    path: 'galeria',
    loadComponent: () => import('./pages/galeria/galeria').then((m) => m.Galeria),
  },
  {
    path: 'acerca',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'terminos',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'chat/:userId',
    loadComponent: () => import('./pages/chat/chat').then((m) => m.ChatComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
