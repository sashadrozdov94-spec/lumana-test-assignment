import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { NotFoundPageComponent } from './pages/404page/404page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    loadComponent: () => MainComponent
  },
  {
    path: '**',
    loadComponent: () => NotFoundPageComponent
  },
];
