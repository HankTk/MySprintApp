import { Component, OnInit, inject, OnDestroy, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StoreService } from '../../../../core/store.service';
import { Order } from '../../models/order.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { Customer } from '../../../customers/models/customer.model';
import { 
  AxButtonComponent, 
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  AxSelectComponent,
  AxSelectOption,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';

@Component({
  selector: 'app-order-list',
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
    AxSelectComponent,
    MatTableModule,
    MatCardModule,
    AxTooltipDirective
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['orderNumber', 'customerName', 'orderDate', 'status', 'total', 'jsonData', 'actions']);
  statusFilter = signal<string | null>(null);
  
  statusOptions: AxSelectOption[] = [
    { value: null, label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'SHIPPING_INSTRUCTED', label: 'Shipping Instructed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'INVOICED', label: 'Invoiced' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];
  
  filteredOrders = computed(() => {
    const orders = this.orders() || [];
    const filter = this.statusFilter();
    
    if (filter) {
      return orders.filter((order: Order) => order.status === filter);
    }
    return orders;
  });

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
    
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          if (event.url === '/orders' || event.urlAfterRedirects === '/orders') {
            this.loadOrders();
          }
        })
    );
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

  onStatusFilterChange(value: any): void {
    this.statusFilter.set(value);
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
    this.router.navigate(['/']);
  }
}
