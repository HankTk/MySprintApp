import { Component, OnInit, inject, OnDestroy, signal, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../../core/store.service';
import { Inventory } from '../../models/inventory.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../../products/services/product.service';
import { WarehouseService } from '../../../warehouses/services/warehouse.service';
import { Product } from '../../../products/models/product.model';
import { Warehouse } from '../../../warehouses/models/warehouse.model';
import { firstValueFrom } from 'rxjs';
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
import { AxTooltipDirective } from '@ui/components';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
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
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['productId', 'warehouseId', 'quantity', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Inventory>[]>([]);

  // Template references for custom cells
  @ViewChild('productIdCell') productIdCellTemplate?: TemplateRef<any>;
  @ViewChild('warehouseIdCell') warehouseIdCellTemplate?: TemplateRef<any>;

  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Inventory>;

  products = signal<Product[]>([]);
  warehouses = signal<Warehouse[]>([]);

  private store = inject(StoreService);
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  inventory = this.store.select('inventory');

  constructor()
  {
    // Reinitialize columns when inventory, products, or warehouses change (using effect)
    effect(() =>
    {
      // Access signals to create dependency
      this.inventory();
      this.products();
      this.warehouses();
      // Reinitialize columns if templates are available

    });
  }

  async ngOnInit(): Promise<void> 
{
    await Promise.all([
      this.loadProducts(),
      this.loadWarehouses()
    ]);
    this.loadInventory();
  }

  ngAfterViewInit(): void
  {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  private async loadProducts(): Promise<void> 
{
    try 
{
      const products = await firstValueFrom(this.productService.getProducts());
      this.products.set(products);
    }
 catch (error)
 {
      console.error('Failed to load products:', error);
    }
  }

  private async loadWarehouses(): Promise<void> 
{
    try 
{
      const warehouses = await firstValueFrom(this.warehouseService.getWarehouses());
      this.warehouses.set(warehouses);
    }
 catch (error)
 {
      console.error('Failed to load warehouses:', error);
    }
  }

  getProductDisplay(productId?: string): string
  {
    if (!productId) return '-';
    const product = this.products().find(p => p.id === productId);
    if (product)
    {
      if (product.productName && product.productCode)
      {
        return `${product.productCode} - ${product.productName}`;
      }
      return product.productName || product.productCode || productId;
    }
    return productId;
  }

  getWarehouseDisplay(warehouseId?: string): string
  {
    if (!warehouseId) return '-';
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    if (warehouse)
    {
      if (warehouse.warehouseName && warehouse.warehouseCode)
      {
        return `${warehouse.warehouseCode} - ${warehouse.warehouseName}`;
      }
      return warehouse.warehouseName || warehouse.warehouseCode || warehouseId;
    }
    return warehouseId;
  }

  ngOnDestroy(): void
  {
    this.subscriptions.unsubscribe();
  }

  loadInventory(): void
  {
    this.inventoryService.loadInventory(this.isLoading);
  }

  openAddInventoryDialog(): void
  {
    this.inventoryService.openAddInventoryDialog(this.isLoading);
  }

  openEditInventoryDialog(inventory: Inventory): void
  {
    this.inventoryService.openEditInventoryDialog(inventory, this.isLoading);
  }

  deleteInventory(inventory: Inventory): void
  {
    this.inventoryService.openDeleteInventoryDialog(inventory, this.isLoading);
  }

  goBack(): void
  {
    this.router.navigate(['/']);
  }

  private initializeColumns(): void
 {
    this.columns.set([
      {
        key: 'productId',
        header: this.languageService.instant('productId'),
        field: 'productId',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: (data: Inventory[]): FilterOption[] => 
{
          const products = this.products() || [];
          const productMap = new Map<string, string>();
          data.forEach(inv => 
{
            if (inv.productId && !productMap.has(inv.productId))
            {
              const product = products.find((p: Product) => p.id === inv.productId);
              const name = product ? (product.productName || product.productCode || inv.productId) : inv.productId;
              productMap.set(inv.productId, name);
            }
          });
          const productNames = Array.from(productMap.entries())
            .map(([id, name]) => ({ value: id || '', label: name || '' }))
            .sort((a, b) => a.label.localeCompare(b.label));
          return [
            { value: '', label: 'All' },
            ...productNames
          ];
        },
        cellTemplate: this.productIdCellTemplate
      },
      {
        key: 'warehouseId',
        header: this.languageService.instant('warehouseId'),
        field: 'warehouseId',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: (data: Inventory[]): FilterOption[] => 
{
          const warehouses = this.warehouses() || [];
          const warehouseMap = new Map<string, string>();
          data.forEach(inv => 
{
            if (inv.warehouseId && !warehouseMap.has(inv.warehouseId))
            {
              const warehouse = warehouses.find((w: Warehouse) => w.id === inv.warehouseId);
              const name = warehouse ? (warehouse.warehouseName || warehouse.warehouseCode || inv.warehouseId) : inv.warehouseId;
              warehouseMap.set(inv.warehouseId, name);
            }
          });
          const warehouseNames = Array.from(warehouseMap.entries())
            .map(([id, name]) => ({ value: id || '', label: name || '' }))
            .sort((a, b) => a.label.localeCompare(b.label));
          return [
            { value: '', label: 'All' },
            ...warehouseNames
          ];
        },
        cellTemplate: this.warehouseIdCellTemplate
      },
      {
        key: 'quantity',
        header: this.languageService.instant('quantity'),
        field: 'quantity',
        sortable: true,
        filterable: true,
        filterType: 'text',
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
