import { Component, EventEmitter, Output } from '@angular/core';
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
  styleUrls: ['./menu-drawer.component.scss']
})
export class MenuDrawerComponent {
  @Output() closeDrawer = new EventEmitter<void>();

  menuItems = [
    { icon: 'people', label: 'menu.users', route: '/users' },
    { icon: 'inventory_2', label: 'menu.products', route: '/products' },
    { icon: 'shopping_cart', label: 'menu.orders', route: '/orders' }
  ];

  onClose(): void {
    this.closeDrawer.emit();
  }
}
