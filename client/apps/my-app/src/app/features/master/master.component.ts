import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { 
  AxButtonComponent, 
  AxIconComponent,
  MatCardModule 
} from '@ui/components';

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
    TranslateModule,
    AxButtonComponent,
    AxIconComponent,
    MatCardModule
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
    { id: 'addresses', route: '/addresses', icon: 'location_on', labelKey: 'menu.addresses' },
    { id: 'warehouses', route: '/warehouses', icon: 'warehouse', labelKey: 'menu.warehouses' },
    { id: 'master-maintenance', route: '/master/maintenance', icon: 'build', labelKey: 'master.maintenance' }
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

