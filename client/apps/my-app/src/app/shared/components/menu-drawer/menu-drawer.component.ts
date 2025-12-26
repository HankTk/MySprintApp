import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { 
  AxButtonComponent, 
  AxIconComponent
} from '@ui/components';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-menu-drawer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent,
    MatListModule
  ],
  templateUrl: './menu-drawer.component.html',
  styleUrls: ['./menu-drawer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MenuDrawerComponent
{
  @Output() closeDrawer = new EventEmitter<void>();

  menuItems = [
    { icon: 'home', label: 'menu.home', route: '/' },
    { icon: 'shopping_cart', label: 'menu.orders', route: '/orders' },
    { icon: 'inventory', label: 'menu.inventory', route: '/inventory' },
    { icon: 'shopping_bag', label: 'menu.purchaseOrders', route: '/purchase-orders' },
    { icon: 'assignment_return', label: 'menu.rmas', route: '/rmas' },
    { icon: 'build', label: 'menu.sfcs', route: '/sfcs' },
    { icon: 'account_balance', label: 'menu.generalLedger', route: '/general-ledger' },
    { icon: 'account_balance_wallet', label: 'menu.accountsReceivable', route: '/account-receivable' },
    { icon: 'account_balance', label: 'menu.accountsPayable', route: '/account-payable' },
    { icon: 'settings', label: 'menu.master', route: '/master' },
  ];

  onClose(): void
  {
    this.closeDrawer.emit();
  }
}
