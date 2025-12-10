import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

interface MasterItem {
  id: string;
  route: string;
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent {
  private router = inject(Router);

  masterItems: MasterItem[] = [
    { id: 'users', route: '/users', icon: 'people', labelKey: 'menu.users' },
    { id: 'customers', route: '/customers', icon: 'group', labelKey: 'menu.customers' },
    { id: 'vendors', route: '/vendors', icon: 'local_shipping', labelKey: 'menu.vendors' },
    { id: 'products', route: '/products', icon: 'inventory_2', labelKey: 'menu.products' },
    { id: 'addresses', route: '/addresses', icon: 'location_on', labelKey: 'menu.addresses' }
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

