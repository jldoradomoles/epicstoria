import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Todas las rutas se renderizan en el servidor bajo demanda (SSR)
  // Esto evita problemas de prerendering con rutas que usan APIs externas o window
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
