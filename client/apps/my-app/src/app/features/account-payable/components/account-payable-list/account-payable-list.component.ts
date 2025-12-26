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
import { PurchaseOrder } from '../../../purchase-orders/models/purchase-order.model';
import { PurchaseOrderService } from '../../../purchase-orders/services/purchase-order.service';
import { VendorService } from '../../../vendors/services/vendor.service';
import { Vendor } from '../../../vendors/models/vendor.model';

@Component({
  selector: 'app-account-payable-list',
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
  templateUrl: './account-payable-list.component.html',
  styleUrls: ['./account-payable-list.component.scss']
})
export class AccountPayableListComponent implements OnInit, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['invoiceNumber', 'poNumber', 'supplier', 'invoiceDate', 'invoiceAmount', 'paidAmount', 'outstanding', 'status', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<PurchaseOrder>[]>([]);

  // Template references for custom cells
  @ViewChild('supplierCell') supplierCellTemplate?: TemplateRef<any>;
  @ViewChild('invoiceDateCell') invoiceDateCellTemplate?: TemplateRef<any>;
  @ViewChild('invoiceAmountCell') invoiceAmountCellTemplate?: TemplateRef<any>;
  @ViewChild('paidAmountCell') paidAmountCellTemplate?: TemplateRef<any>;
  @ViewChild('outstandingCell') outstandingCellTemplate?: TemplateRef<any>;
  @ViewChild('statusCell') statusCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<PurchaseOrder>;

  private store = inject(StoreService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  purchaseOrders = this.store.select('purchase-orders');
  vendors = this.store.select('vendors');

  // Filter POs that have been invoiced (INVOICED or PAID status)
  invoicedPOs = computed(() =>
  {
    const pos = this.purchaseOrders() || [];
    return pos.filter((po: PurchaseOrder) =>
      po.status === 'INVOICED' || po.status === 'PAID'
    ).map((po: PurchaseOrder) => ({
      ...po,
      outstandingAmount: Math.max(0, (po.total || 0) - (po.jsonData?.paymentAmount || 0))
    }));
  });

  // No need for separate filteredPOs computed - ax-table handles filtering internally
  filteredPOs = this.invoicedPOs;

  constructor()
  {
    // Reinitialize columns when purchase orders or vendors change (using effect)
    effect(() =>
    {
      // Access signals to create dependency
      this.invoicedPOs();
      this.vendors();
      // Reinitialize columns if templates are available
      if (this.statusCellTemplate)
      {
        this.initializeColumns();
      }
    });
  }

  ngOnInit(): void
  {
    this.loadPurchaseOrders();
    this.loadVendors();
  }

  ngAfterViewInit(): void
  {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  private initializeColumns(): void
 {
    this.columns.set([
      {
        key: 'invoiceNumber',
        header: this.languageService.instant('accountsPayable.table.invoiceNumber'),
        field: 'invoiceNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'poNumber',
        header: this.languageService.instant('accountsPayable.table.poNumber'),
        field: 'orderNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value, row) => value || row.id?.substring(0, 8) || '-'
      },
      {
        key: 'supplier',
        header: this.languageService.instant('accountsPayable.supplier'),
        field: 'supplierId',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: (data: PurchaseOrder[]): FilterOption[] => 
{
          const vendors = this.vendors() || [];
          const vendorMap = new Map<string, string>();
          data.forEach(po => 
{
            if (po.supplierId && !vendorMap.has(po.supplierId))
            {
              const vendor = vendors.find((v: Vendor) => v.id === po.supplierId);
              const name = vendor ? (vendor.companyName || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email || po.supplierId) : (po.supplierId || '');
              vendorMap.set(po.supplierId, name);
            }
          });
          const vendorNames = Array.from(vendorMap.entries())
            .map(([id, name]) => ({ value: id || '', label: name || '' }))
            .sort((a, b) => a.label.localeCompare(b.label));
          return [
            { value: '', label: 'All' },
            ...vendorNames
          ];
        },
        cellTemplate: this.supplierCellTemplate
      },
      {
        key: 'invoiceDate',
        header: this.languageService.instant('accountsPayable.table.invoiceDate'),
        field: 'invoiceDate',
        sortable: true,
        filterable: true,
        filterType: 'date-range',
        cellTemplate: this.invoiceDateCellTemplate
      },
      {
        key: 'invoiceAmount',
        header: this.languageService.instant('accountsPayable.table.invoiceAmount'),
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
        header: this.languageService.instant('accountsPayable.table.paidAmount'),
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
        header: this.languageService.instant('accountsPayable.outstanding'),
        // Outstanding is calculated: total - paidAmount. Since we can't easily filter by a calculated field on the frontend
        // without adding it to the data model, we'll map it in the data source if needed, or rely on client-side filtering 
        // if the table supports it. For now, let's enable it and see.
        // Actually, ax-table filtering works on the 'field' property. If we want to filter by outstanding, 
        // we might need to compute it.
        // But wait, the column definition doesn't direct filtering, key does? No, 'field' does.
        // Let's use 'total' as placeholder or if table logic allows custom filter function (which ax-table seems to rely on 'field').
        // Since we can't easily filter by computed field without data transformation, I will stick to enabling it
        // but pointing to 'total' which is incorrect. 
        // Better approach: In AccountsPayable, outstanding is calculated in template: calculateOutstandingAmount(po)
        // I should probably not enable filter for 'outstanding' unless I add it to the model/data like I did for GL debit/credit.
        // Reviewing plan... "Set filterable: true for ... outstanding".
        // To make it work, I need to add 'outstandingAmount' to the data objects.
        // I will do that in the same map/load logic if possible, or just skip it if it's too complex for now.
        // Wait, AccountPayableListComponent uses `invoicedPOs` computed signal.
        // I can map it there!
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
        header: this.languageService.instant('accountsPayable.table.status'),
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

  clearTableFilters(): void
  {
    if (this.axTable)
    {
      this.axTable.clearFilters();
    }
  }

  getClearFiltersLabel(): string
  {
    const translated = this.languageService.instant('clearFilters');
    // If translation returns the key itself, it means the key wasn't found
    return translated && translated !== 'clearFilters' ? translated : 'Clear Filters';
  }

  toggleFilters(): void
  {
    const currentValue = this.showFilters();
    const newValue = !currentValue;

    // Update both signal and property
    this.showFilters.set(newValue);
    this.showFilterValue = newValue;

    // Force change detection to ensure the binding is updated
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private loadPurchaseOrders(): void
 {
    this.purchaseOrderService.loadPurchaseOrders(this.isLoading);
  }

  private loadVendors(): void
 {
    this.vendorService.loadVendors(this.isLoading);
  }

  getSupplierName(supplierId?: string): string
  {
    if (!supplierId) return 'N/A';
    const vendors = this.vendors() || [];
    const vendor = vendors.find((v: Vendor) => v.id === supplierId);
    return vendor ? (vendor.companyName || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email || 'N/A') : supplierId;
  }

  formatDate(dateString?: string | Date): string
  {
    if (!dateString) return 'N/A';
    try 
{
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      return date.toLocaleDateString();
    }
 catch
 {
      return String(dateString);
    }
  }

  calculateOutstandingAmount(po: PurchaseOrder): number
  {
    const total = po.total || 0;
    const paidAmount = po.jsonData?.paymentAmount || 0;
    return Math.max(0, total - paidAmount);
  }

  getStatusColor(status?: string): string
  {
    switch (status)
    {
      case 'INVOICED':
        return '#8B5CF6'; // Purple
      case 'PAID':
        return '#047857'; // Dark green
      default:
        return '#6B7280'; // Gray
    }
  }

  getStatusBackgroundColor(status?: string): string
  {
    switch (status)
    {
      case 'INVOICED':
        return '#EDE9FE'; // Light purple
      case 'PAID':
        return '#D1FAE5'; // Light green
      default:
        return '#F3F4F6'; // Light gray
    }
  }

  getStatusLabel(status?: string): string
  {
    switch (status)
    {
      case 'INVOICED':
        return 'Invoiced';
      case 'PAID':
        return 'Paid';
      default:
        return status || 'N/A';
    }
  }

  viewInvoice(po: PurchaseOrder): void
  {
    this.router.navigate(['/account-payable', po.id]);
  }

  goBack(): void
  {
    this.router.navigate(['/']);
  }
}

