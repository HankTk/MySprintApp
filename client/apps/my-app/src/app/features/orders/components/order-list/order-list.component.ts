import { Component, OnInit, inject, OnDestroy, signal, computed, ViewChild, TemplateRef, AfterViewInit, effect, ChangeDetectorRef } from '@angular/core';
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
  AxTableColumnDef,
  FilterOption,
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
    MatTableModule,
    MatCardModule,
    AxTooltipDirective
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['orderNumber', 'customerName', 'orderDate', 'status', 'total', 'actions']);
  showFilters = signal<boolean>(true);
  showFiltersValue = true; // Non-signal version for input binding
  
  // Table-level flag: whether the table supports filtering
  tableFilterable = true;
  
  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Order>[]>([]);
  
  // Template references for custom cells
  @ViewChild('statusCell') statusCellTemplate?: TemplateRef<any>;
  @ViewChild('totalCell') totalCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;
  
  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Order>;
  
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

  private store = inject(StoreService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  orders = this.store.select('orders');
  customers = this.store.select('customers');
  
  // No need for separate filteredOrders computed - ax-table handles filtering internally
  filteredOrders = this.orders;
  
  constructor() {
    // Reinitialize columns when orders or customers change (using effect)
    effect(() => {
      // Access signals to create dependency
      this.orders();
      this.customers();
      // Reinitialize columns if templates are available
      if (this.statusCellTemplate) {
        this.initializeColumns();
      }
    });
    
    // Sync showFilters signal to showFiltersValue property for input binding
    effect(() => {
      this.showFiltersValue = this.showFilters();
      console.log('[OrderList] effect: showFiltersValue updated to', this.showFiltersValue);
      this.cdr.detectChanges();
    });
  }

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

  ngAfterViewInit(): void {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  private initializeColumns(): void {
    this.columns.set([
      {
        key: 'orderNumber',
        header: this.languageService.instant('orderNumber'),
        field: 'orderNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'customerName',
        header: this.languageService.instant('customerName'),
        field: 'customerId',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: (data: Order[]): FilterOption[] => {
          const customers = this.customers() || [];
          const customerMap = new Map<string, string>();
          data.forEach(order => {
            if (order.customerId && !customerMap.has(order.customerId)) {
              const customer = customers.find((c: Customer) => c.id === order.customerId);
              const name = customer ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email || order.customerId) : (order.customerId || '');
              customerMap.set(order.customerId, name);
            }
          });
          const customerNames = Array.from(customerMap.entries())
            .map(([id, name]) => ({ value: id || '', label: name || '' }))
            .sort((a, b) => a.label.localeCompare(b.label));
          return [
            { value: '', label: 'All' },
            ...customerNames
          ];
        },
        formatter: (value, row) => this.getCustomerName(row.customerId)
      },
      {
        key: 'orderDate',
        header: this.languageService.instant('orderDate'),
        field: 'orderDate',
        sortable: true,
        filterable: true,
        filterType: 'date-range',
        formatter: (value) => this.formatDate(value)
      },
      {
        key: 'status',
        header: this.languageService.instant('status'),
        field: 'status',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { value: '', label: 'All' },
          ...this.statusOptions.filter(opt => opt.value !== null).map(opt => ({
            value: opt.value as string,
            label: opt.label
          }))
        ],
        cellTemplate: this.statusCellTemplate
      },
      {
        key: 'total',
        header: this.languageService.instant('total'),
        field: 'total',
        sortable: true,
        filterable: false,
        align: 'right',
        cellTemplate: this.totalCellTemplate
      },
      {
        key: 'actions',
        header: this.languageService.instant('actions'),
        field: 'id',
        sortable: false,
        filterable: false,
        cellTemplate: this.actionsCellTemplate
      }
    ]);
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
    // Convert status like "PENDING_APPROVAL" to "pendingApproval" to match translation keys
    const camelCaseStatus = status.toLowerCase().split('_').map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    const key = `order.status.${camelCaseStatus}`;
    const translated = this.languageService.instant(key);
    // If translation returns the key itself, it means the key wasn't found, return original status
    return translated && translated !== key ? translated : status;
  }

  deleteOrder(order: Order): void {
    this.orderService.openDeleteOrderDialog(order, this.isLoading);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  clearTableFilters(): void {
    if (this.axTable) {
      this.axTable.clearFilters();
    }
  }

  getClearFiltersLabel(): string {
    const translated = this.languageService.instant('clearFilters');
    // If translation returns the key itself, it means the key wasn't found
    return translated && translated !== 'clearFilters' ? translated : 'Clear Filters';
  }

  toggleFilters(): void {
    const newValue = !this.showFilters();
    console.log('[OrderList] Toggling filters:', this.showFilters(), '->', newValue);
    this.showFilters.set(newValue);
    this.showFiltersValue = newValue; // Update non-signal version
    console.log('[OrderList] showFilters signal value:', this.showFilters());
    console.log('[OrderList] showFiltersValue:', this.showFiltersValue);
    this.cdr.detectChanges();
  }
}
