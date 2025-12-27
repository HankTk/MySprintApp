import {
  Component,
  OnInit,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  AfterViewInit,
  effect
} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {
  AxButtonComponent,
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  AxTableColumnDef,
  FilterOption,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import {AxTooltipDirective} from '@ui/components';
import {StoreService} from '../../../../core/store.service';
import {PurchaseOrder} from '../../models/purchase-order.model';
import {TranslateModule} from '@ngx-translate/core';
import {LanguageService} from '../../../../shared/services/language.service';
import {Subscription} from 'rxjs';
import {PurchaseOrderService} from '../../services/purchase-order.service';
import {VendorService} from '../../../vendors/services/vendor.service';
import {Vendor} from '../../../vendors/models/vendor.model';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-purchase-order-list',
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
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss']
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['orderNumber', 'supplierName', 'orderDate', 'status', 'total', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<PurchaseOrder>[]>([]);

  // Template references for custom cells
  @ViewChild('supplierNameCell') supplierNameCellTemplate?: TemplateRef<any>;
  @ViewChild('orderDateCell') orderDateCellTemplate?: TemplateRef<any>;
  @ViewChild('totalCell') totalCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<PurchaseOrder>;

  vendors = signal<Vendor[]>([]);

  private store = inject(StoreService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  purchaseOrders = this.store.select('purchase-orders');

  constructor()
  {
    // Reinitialize columns when purchase orders or vendors change (using effect)
    effect(() =>
    {
      // Access signals to create dependency
      this.purchaseOrders();
      this.vendors();
      // Reinitialize columns if templates are available
      if (this.supplierNameCellTemplate)
      {
        this.initializeColumns();
      }
    });
  }

  async ngOnInit(): Promise<void>
  {
    await this.loadVendors();
    this.loadPurchaseOrders();
  }

  ngAfterViewInit(): void
  {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  ngOnDestroy(): void
  {
    this.subscriptions.unsubscribe();
  }

  private initializeColumns(): void
  {
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
        key: 'supplierName',
        header: this.languageService.instant('supplier'),
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
              const name = vendor ? (vendor.companyName || `${vendor.lastName} ${vendor.firstName}` || vendor.email || po.supplierId) : (po.supplierId || '');
              vendorMap.set(po.supplierId, name);
            }
          });
          const vendorNames = Array.from(vendorMap.entries())
              .map(([id, name]) => ({value: id || '', label: name || ''}))
              .sort((a, b) => a.label.localeCompare(b.label));
          return [
            {value: '', label: 'All'},
            ...vendorNames
          ];
        },
        cellTemplate: this.supplierNameCellTemplate
      },
      {
        key: 'orderDate',
        header: this.languageService.instant('orderDate'),
        field: 'orderDate',
        sortable: true,
        filterable: true,
        filterType: 'date-range',
        cellTemplate: this.orderDateCellTemplate
      },
      {
        key: 'status',
        header: this.languageService.instant('status'),
        field: 'status',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'total',
        header: this.languageService.instant('total'),
        field: 'total',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.totalCellTemplate,
        formatter: (value) => (value || 0).toString()
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

  loadPurchaseOrders(): void
  {
    this.purchaseOrderService.loadPurchaseOrders(this.isLoading);
  }

  openAddPurchaseOrderDialog(): void
  {
    this.purchaseOrderService.openAddPurchaseOrderEntry(this.isLoading);
  }

  openEditPurchaseOrderDialog(po: PurchaseOrder): void
  {
    this.purchaseOrderService.openEditPurchaseOrderEntry(po, this.isLoading);
  }

  deletePurchaseOrder(po: PurchaseOrder): void
  {
    this.purchaseOrderService.openDeletePurchaseOrderDialog(po, this.isLoading);
  }

  goBack(): void
  {
    this.router.navigate(['/']);
  }

  private async loadVendors(): Promise<void>
  {
    try
    {
      const vendors = await firstValueFrom(this.vendorService.getVendors());
      this.vendors.set(vendors);
    }
    catch (err)
    {
      console.error('Error loading vendors:', err);
    }
  }

  getSupplierName(supplierId?: string): string
  {
    if (!supplierId) return 'N/A';
    const vendors = this.vendors() || [];
    const vendor = vendors.find((v: Vendor) => v.id === supplierId);
    if (vendor)
    {
      return vendor.companyName || `${vendor.lastName} ${vendor.firstName}` || vendor.email || supplierId;
    }
    return supplierId;
  }

  formatDate(dateString?: string): string
  {
    if (!dateString) return 'N/A';
    try
    {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
    catch
    {
      return dateString;
    }
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
}

