import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/components/login/login.component';
import { InitialUserComponent } from './features/auth/components/initial-user/initial-user.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'initial-user',
    component: InitialUserComponent
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./features/main-layout/main-layout.routes').then(m => m.routes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
