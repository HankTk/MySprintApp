import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { 
  AxButtonComponent, 
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  AxChipComponent,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../../../core/store.service';
import { Order } from '../../../orders/models/order.model';
import { OrderService } from '../../../orders/services/order.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { Customer } from '../../../customers/models/customer.model';

@Component({
  selector: 'app-account-receivable-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    TranslateModule,
    AxButtonComponent,
    AxProgressComponent,
    AxCardComponent,
    AxIconComponent,
    AxTableComponent,
    AxChipComponent,
    MatTableModule,
    MatCardModule,
    AxTooltipDirective,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './account-receivable-list.component.html',
  styleUrls: ['./account-receivable-list.component.scss']
})
export class AccountReceivableListComponent implements OnInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['invoiceNumber', 'orderNumber', 'customer', 'invoiceDate', 'invoiceAmount', 'paidAmount', 'outstanding', 'status', 'actions']);
  statusFilter = signal<string | null>(null);
  
  private store = inject(StoreService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  orders = this.store.select('orders');
  customers = this.store.select('customers');

  // Filter orders that have been invoiced (INVOICED or PAID status)
  invoicedOrders = computed(() => {
    const orders = this.orders() || [];
    return orders.filter((order: Order) => 
      order.status === 'INVOICED' || order.status === 'PAID'
    );
  });

  filteredOrders = computed(() => {
    const orders = this.invoicedOrders();
    const filter = this.statusFilter();
    if (filter) {
      return orders.filter((order: Order) => order.status === filter);
    }
    return orders;
  });

  ngOnInit(): void {
    this.loadOrders();
    this.loadCustomers();
  }

  private loadOrders(): void {
    this.orderService.loadOrders(this.isLoading);
  }

  private loadCustomers(): void {
    this.customerService.loadCustomers(this.isLoading);
  }

  getCustomerName(customerId?: string): string {
    if (!customerId) return 'N/A';
    const customers = this.customers() || [];
    const customer = customers.find((c: Customer) => c.id === customerId);
    return customer ? (customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'N/A') : customerId;
  }

  formatDate(dateString?: string | Date): string {
    if (!dateString) return 'N/A';
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return String(dateString);
    }
  }

  calculateOutstandingAmount(order: Order): number {
    const total = order.total || 0;
    const paymentAmount = order.jsonData?.paymentAmount || 0;
    return Math.max(0, total - paymentAmount);
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'INVOICED':
        return '#8B5CF6'; // Purple
      case 'PAID':
        return '#047857'; // Dark green
      default:
        return '#6B7280'; // Gray
    }
  }

  getStatusBackgroundColor(status?: string): string {
    switch (status) {
      case 'INVOICED':
        return '#EDE9FE'; // Light purple
      case 'PAID':
        return '#D1FAE5'; // Light green
      default:
        return '#F3F4F6'; // Light gray
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'INVOICED':
        return 'Invoiced';
      case 'PAID':
        return 'Paid';
      default:
        return status || 'N/A';
    }
  }

  viewInvoice(order: Order): void {
    this.router.navigate(['/account-receivable', order.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

