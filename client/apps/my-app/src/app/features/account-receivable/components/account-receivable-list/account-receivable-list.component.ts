import { Component, OnInit, inject, signal, computed, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  AxButtonComponent,
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  AxTableColumnDef,
  FilterOption,
  AxChipComponent,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
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
export class AccountReceivableListComponent implements OnInit, AfterViewInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['invoiceNumber', 'orderNumber', 'customer', 'invoiceDate', 'invoiceAmount', 'paidAmount', 'outstanding', 'status', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Order>[]>([]);

  // Template references for custom cells
  @ViewChild('customerCell') customerCellTemplate?: TemplateRef<any>;
  @ViewChild('invoiceDateCell') invoiceDateCellTemplate?: TemplateRef<any>;
  @ViewChild('invoiceAmountCell') invoiceAmountCellTemplate?: TemplateRef<any>;
  @ViewChild('paidAmountCell') paidAmountCellTemplate?: TemplateRef<any>;
  @ViewChild('outstandingCell') outstandingCellTemplate?: TemplateRef<any>;
  @ViewChild('statusCell') statusCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Order>;

  private store = inject(StoreService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  orders = this.store.select('orders');
  customers = this.store.select('customers');

  // Filter orders that have been invoiced (INVOICED or PAID status)
  invoicedOrders = computed(() => {
    const orders = this.orders() || [];
    return orders.filter((order: Order) =>
      order.status === 'INVOICED' || order.status === 'PAID'
    ).map((order: Order) => ({
      ...order,
      outstandingAmount: Math.max(0, (order.total || 0) - (order.jsonData?.paymentAmount || 0))
    }));
  });

  // No need for separate filteredOrders computed - ax-table handles filtering internally
  filteredOrders = this.invoicedOrders;

  constructor() {
    // Reinitialize columns when orders or customers change (using effect)
    effect(() => {
      // Access signals to create dependency
      this.invoicedOrders();
      this.customers();
      // Reinitialize columns if templates are available
      if (this.statusCellTemplate) {
        this.initializeColumns();
      }
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  private initializeColumns(): void {
    this.columns.set([
      {
        key: 'invoiceNumber',
        header: this.languageService.instant('accountsReceivable.table.invoiceNumber'),
        field: 'invoiceNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'orderNumber',
        header: this.languageService.instant('accountsReceivable.table.orderNumber'),
        field: 'orderNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value, row) => value || row.id?.substring(0, 8) || '-'
      },
      {
        key: 'customer',
        header: this.languageService.instant('accountsReceivable.customer'),
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
              const name = customer ? (customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || order.customerId) : (order.customerId || '');
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
        cellTemplate: this.customerCellTemplate
      },
      {
        key: 'invoiceDate',
        header: this.languageService.instant('accountsReceivable.table.invoiceDate'),
        field: 'invoiceDate',
        sortable: true,
        filterable: true,
        filterType: 'date-range',
        cellTemplate: this.invoiceDateCellTemplate
      },
      {
        key: 'invoiceAmount',
        header: this.languageService.instant('accountsReceivable.table.invoiceAmount'),
        field: 'total',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.invoiceAmountCellTemplate,
        formatter: (value) => (value || 0).toString()
      },
      {
        key: 'paidAmount',
        header: this.languageService.instant('accountsReceivable.table.paidAmount'),
        field: 'jsonData.paymentAmount',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.paidAmountCellTemplate,
        formatter: (value) => (value || 0).toString()
      },
      {
        key: 'outstanding',
        header: this.languageService.instant('accountsReceivable.outstanding'),
        field: 'outstandingAmount',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.outstandingCellTemplate,
        formatter: (value) => (value || 0).toString()
      },
      {
        key: 'status',
        header: this.languageService.instant('accountsReceivable.table.status'),
        field: 'status',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { value: '', label: 'All' },
          { value: 'INVOICED', label: 'Invoiced' },
          { value: 'PAID', label: 'Paid' }
        ],
        cellTemplate: this.statusCellTemplate
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
    const currentValue = this.showFilters();
    const newValue = !currentValue;

    // Update both signal and property
    this.showFilters.set(newValue);
    this.showFilterValue = newValue;

    // Force change detection to ensure the binding is updated
    this.cdr.markForCheck();
    this.cdr.detectChanges();
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

