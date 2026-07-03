import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatNativeDateModule } from "@angular/material/core";
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from "@angular/platform-browser/animations";
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { characterReducer } from './store/characters.reducers';
import { CharacterEffects } from './store/character.effects';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
 providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimations(),
    importProvidersFrom(MatNativeDateModule, BrowserAnimationsModule),
    provideStore({
      character: characterReducer
    }),
    provideEffects([CharacterEffects]),
    provideStoreDevtools({ maxAge: 30, logOnly: !isDevMode() }),
  ]
};
