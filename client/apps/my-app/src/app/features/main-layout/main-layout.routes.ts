import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { UserManagementComponent } from '../users/components/user-management/user-management.component';
import { ProductListComponent } from '../products/components/product-list/product-list.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: WelcomeComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'products',
        component: ProductListComponent
      },
      {
        path: 'orders',
        loadComponent: () => import('../orders/components/order-list/order-list.component').then(m => m.OrderListComponent)
      }
    ]
  }
];
