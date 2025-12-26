import { Component, OnInit, inject, OnDestroy, signal, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StoreService } from '../../../../core/store.service';
import { Product } from '../../models/product.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { ProductService } from '../../services/product.service';
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
  selector: 'app-product-list',
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
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['productCode', 'productName', 'description', 'unitPrice', 'cost', 'unitOfMeasure', 'active', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Product>[]>([]);

  // Template references for custom cells
  @ViewChild('unitPriceCell') unitPriceCellTemplate?: TemplateRef<any>;
  @ViewChild('costCell') costCellTemplate?: TemplateRef<any>;
  @ViewChild('activeCell') activeCellTemplate?: TemplateRef<any>;

  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Product>;

  private store = inject(StoreService);
  private productService = inject(ProductService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  products = this.store.select('products');

  constructor()
  {
    // Reinitialize columns when products change (using effect)
    effect(() =>
    {
      // Access signal to create dependency
      this.products();
      // Reinitialize columns if templates are available

    });
  }

  ngOnInit(): void
  {
    this.loadProducts();
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
        key: 'productCode',
        header: this.languageService.instant('productCode'),
        field: 'productCode',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'productName',
        header: this.languageService.instant('productName'),
        field: 'productName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'description',
        header: this.languageService.instant('description'),
        field: 'description',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'unitPrice',
        header: this.languageService.instant('unitPrice'),
        field: 'unitPrice',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.unitPriceCellTemplate,
        formatter: (value) => (value || 0).toString()
      },
      {
        key: 'cost',
        header: this.languageService.instant('cost'),
        field: 'cost',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.costCellTemplate,
        formatter: (value) => (value || 0).toString()
      },
      {
        key: 'unitOfMeasure',
        header: this.languageService.instant('unitOfMeasure'),
        field: 'unitOfMeasure',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'active',
        header: this.languageService.instant('active'),
        field: 'active',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { value: '', label: 'All' },
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' }
        ],
        cellTemplate: this.activeCellTemplate
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

  loadProducts(): void
  {
    this.productService.loadProducts(this.isLoading);
  }

  openAddProductDialog(): void
  {
    this.productService.openAddProductDialog(this.isLoading);
  }

  openEditProductDialog(product: Product): void
  {
    this.productService.openEditProductDialog(product, this.isLoading);
  }

  deleteProduct(product: Product): void
  {
    this.productService.openDeleteProductDialog(product, this.isLoading);
  }

  goBack(): void
  {
    this.router.navigate(['/master']);
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
