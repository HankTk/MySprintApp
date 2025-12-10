import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { UserManagementComponent } from '../users/components/user-management/user-management.component';
import { ProductListComponent } from '../products/components/product-list/product-list.component';
import { CustomerListComponent } from '../customers/components/customer-list/customer-list.component';
import { MasterComponent } from '../master/master.component';

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
        path: 'customers',
        component: CustomerListComponent
      },
      {
        path: 'addresses',
        loadComponent: () => import('../addresses/components/address-list/address-list.component').then(m => m.AddressListComponent)
      },
      {
        path: 'vendors',
        loadComponent: () => import('../vendors/components/vendor-list/vendor-list.component').then(m => m.VendorListComponent)
      },
      {
        path: 'warehouses',
        loadComponent: () => import('../warehouses/components/warehouse-list/warehouse-list.component').then(m => m.WarehouseListComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('../inventory/components/inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
      },
      {
        path: 'purchase-orders',
        loadComponent: () => import('../purchase-orders/components/po-list/po-list.component').then(m => m.PurchaseOrderListComponent)
      },
      {
        path: 'rmas',
        loadComponent: () => import('../rmas/components/rma-list/rma-list.component').then(m => m.RMAListComponent)
      },
      {
        path: 'sfcs',
        loadComponent: () => import('../sfcs/components/sfc-list/sfc-list.component').then(m => m.SFCListComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../orders/components/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'master',
        component: MasterComponent
      }
    ]
  }
];
