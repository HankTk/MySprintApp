import {Routes} from '@angular/router';

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
  },
  {
    path: 'icon',
    loadComponent: () => import('./pages/icon-page/icon-page.component').then(m => m.IconPageComponent)
  },
  {
    path: 'select',
    loadComponent: () => import('./pages/select-page/select-page.component').then(m => m.SelectPageComponent)
  },
  {
    path: 'datepicker',
    loadComponent: () => import('./pages/datepicker-page/datepicker-page.component').then(m => m.DatepickerPageComponent)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs-page/tabs-page.component').then(m => m.TabsPageComponent)
  },
  {
    path: 'chip',
    loadComponent: () => import('./pages/chip-page/chip-page.component').then(m => m.ChipPageComponent)
  },
  {
    path: 'textarea',
    loadComponent: () => import('./pages/textarea-page/textarea-page.component').then(m => m.TextareaPageComponent)
  },
  {
    path: 'tooltip',
    loadComponent: () => import('./pages/tooltip-page/tooltip-page.component').then(m => m.TooltipPageComponent)
  },
  {
    path: 'typography',
    loadComponent: () => import('./pages/typography-page/typography-page.component').then(m => m.TypographyPageComponent)
  },
  {
    path: 'chart',
    loadComponent: () => import('./pages/chart-page/chart-page.component').then(m => m.ChartPageComponent)
  },
  {
    path: 'three',
    loadComponent: () => import('./pages/three-page/three-page.component').then(m => m.ThreePageComponent)
  }
];

