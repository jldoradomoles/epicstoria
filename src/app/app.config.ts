import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
  withViewTransitions,
} from '@angular/router';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';

// Registrar locale español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // Precargar todos los módulos lazy después de la carga inicial
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: () => {
          window.scrollTo(0, 0);
        },
      }),
    ),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'es' },
    provideClientHydration(withEventReplay()),
  ],
};
