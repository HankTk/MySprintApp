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
        path: 'purchase-orders/new',
        loadComponent: () => import('../purchase-orders/components/po-entry/po-entry.component').then(m => m.PurchaseOrderEntryComponent)
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () => import('../purchase-orders/components/po-entry/po-entry.component').then(m => m.PurchaseOrderEntryComponent)
      },
      {
        path: 'rmas',
        loadComponent: () => import('../rmas/components/rma-list/rma-list.component').then(m => m.RMAListComponent)
      },
      {
        path: 'rmas/new',
        loadComponent: () => import('../rmas/components/rma-entry/rma-entry.component').then(m => m.RMAEntryComponent)
      },
      {
        path: 'rmas/:id',
        loadComponent: () => import('../rmas/components/rma-entry/rma-entry.component').then(m => m.RMAEntryComponent)
      },
      {
        path: 'sfcs',
        loadComponent: () => import('../sfcs/components/sfc-list/sfc-list.component').then(m => m.SFCListComponent)
      },
      {
        path: 'sfcs/new',
        loadComponent: () => import('../sfcs/components/sfc-entry/sfc-entry.component').then(m => m.SFCEntryComponent)
      },
      {
        path: 'sfcs/:id',
        loadComponent: () => import('../sfcs/components/sfc-entry/sfc-entry.component').then(m => m.SFCEntryComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../orders/components/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'orders/new',
        loadComponent: () => import('../orders/components/order-entry/order-entry.component').then(m => m.OrderEntryComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('../orders/components/order-entry/order-entry.component').then(m => m.OrderEntryComponent)
      },
      {
        path: 'general-ledger',
        loadComponent: () => import('../general-ledger/components/general-ledger-list/general-ledger-list.component').then(m => m.GeneralLedgerListComponent)
      },
      {
        path: 'account-receivable',
        loadComponent: () => import('../account-receivable/components/account-receivable-list/account-receivable-list.component').then(m => m.AccountReceivableListComponent)
      },
      {
        path: 'account-receivable/:id',
        loadComponent: () => import('../account-receivable/components/account-receivable-detail/account-receivable-detail.component').then(m => m.AccountReceivableDetailComponent)
      },
      {
        path: 'account-payable',
        loadComponent: () => import('../account-payable/components/account-payable-list/account-payable-list.component').then(m => m.AccountPayableListComponent)
      },
      {
        path: 'account-payable/:id',
        loadComponent: () => import('../account-payable/components/account-payable-detail/account-payable-detail.component').then(m => m.AccountPayableDetailComponent)
      },
      {
        path: 'master',
        component: MasterComponent
      },
      {
        path: 'master/maintenance',
        loadComponent: () => import('../master/components/master-maintenance/master-maintenance.component').then(m => m.MasterMaintenanceComponent)
      }
    ]
  }
];
