import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'button',
    pathMatch: 'full'
  },
  {
    path: 'button',
    loadComponent: () => import('./pages/button-page/button-page.component').then(m => m.ButtonPageComponent)
  },
  {
    path: 'card',
    loadComponent: () => import('./pages/card-page/card-page.component').then(m => m.CardPageComponent)
  },
  {
    path: 'input',
    loadComponent: () => import('./pages/input-page/input-page.component').then(m => m.InputPageComponent)
  },
  {
    path: 'table',
    loadComponent: () => import('./pages/table-page/table-page.component').then(m => m.TablePageComponent)
  },
  {
    path: 'dialog',
    loadComponent: () => import('./pages/dialog-page/dialog-page.component').then(m => m.DialogPageComponent)
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./pages/checkbox-page/checkbox-page.component').then(m => m.CheckboxPageComponent)
  },
  {
    path: 'radio',
    loadComponent: () => import('./pages/radio-page/radio-page.component').then(m => m.RadioPageComponent)
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress-page/progress-page.component').then(m => m.ProgressPageComponent)
  },
  {
    path: 'listbox',
    loadComponent: () => import('./pages/listbox-page/listbox-page.component').then(m => m.ListboxPageComponent)
  },
  {
    path: 'date-range-picker',
    loadComponent: () => import('./pages/date-range-picker-page/date-range-picker-page.component').then(m => m.DateRangePickerPageComponent)
  }
];

