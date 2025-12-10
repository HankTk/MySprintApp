import { Component, OnInit, inject, OnDestroy, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StoreService } from '../../../../core/store.service';
import { Order } from '../../models/order.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { Customer } from '../../../customers/models/customer.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslateModule
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['orderNumber', 'customerName', 'orderDate', 'status', 'total', 'jsonData', 'actions']);
  statusFilter = signal<string | null>(null);
  filteredOrders = signal<Order[]>([]);

  private store = inject(StoreService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  orders = this.store.select('orders');
  customers = this.store.select('customers');

  ngOnInit(): void {
    this.loadOrders();
    this.loadCustomers();
    
    // Apply filter when orders change
    effect(() => {
      this.orders();
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadOrders(): void {
    this.orderService.loadOrders(this.isLoading);
  }

  loadCustomers(): void {
    this.customerService.loadCustomers(this.isLoading);
  }

  openAddOrderDialog(): void {
    this.orderService.openAddOrderDialog(this.isLoading);
  }

  openEditOrderDialog(order: Order): void {
    this.orderService.openEditOrderDialog(order, this.isLoading);
  }

  applyFilter(): void {
    const orders = this.orders() || [];
    const filter = this.statusFilter();
    
    if (filter) {
      this.filteredOrders.set(orders.filter((order: Order) => order.status === filter));
    } else {
      this.filteredOrders.set(orders);
    }
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value || null);
    this.applyFilter();
  }

  getCustomerName(customerId?: string): string {
    if (!customerId) return 'N/A';
    const customers = this.customers() || [];
    const customer = customers.find((c: Customer) => c.id === customerId);
    if (customer) {
      return customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email || customerId;
    }
    return customerId;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  getStatusColor(status?: string): string {
    return this.orderService.getStatusColor(status);
  }

  getStatusBackgroundColor(status?: string): string {
    return this.orderService.getStatusBackgroundColor(status);
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'N/A';
    const key = `order.status.${status.toLowerCase()}`;
    return this.languageService.instant(key) || status;
  }

  deleteOrder(order: Order): void {
    this.orderService.openDeleteOrderDialog(order, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
