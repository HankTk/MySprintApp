import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-menu-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './menu-drawer.component.html',
  styleUrls: ['./menu-drawer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MenuDrawerComponent {
  @Output() closeDrawer = new EventEmitter<void>();

  menuItems = [
    { icon: 'home', label: 'menu.home', route: '/' },
    { icon: 'people', label: 'menu.users', route: '/users' },
    { icon: 'inventory_2', label: 'menu.products', route: '/products' },
    { icon: 'person', label: 'menu.customers', route: '/customers' },
    { icon: 'location_on', label: 'menu.addresses', route: '/addresses' },
    { icon: 'business', label: 'menu.vendors', route: '/vendors' },
    { icon: 'warehouse', label: 'menu.warehouses', route: '/warehouses' },
    { icon: 'inventory', label: 'menu.inventory', route: '/inventory' },
    { icon: 'shopping_cart', label: 'menu.orders', route: '/orders' },
    { icon: 'shopping_bag', label: 'menu.purchaseOrders', route: '/purchase-orders' },
    { icon: 'assignment_return', label: 'menu.rmas', route: '/rmas' },
    { icon: 'build', label: 'menu.sfcs', route: '/sfcs' },
    { icon: 'account_balance', label: 'menu.generalLedger', route: '/general-ledger' }
  ];

  onClose(): void {
    this.closeDrawer.emit();
  }
}
