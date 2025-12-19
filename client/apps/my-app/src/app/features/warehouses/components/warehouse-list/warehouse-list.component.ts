import { Component, OnInit, inject, OnDestroy, signal, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { StoreService } from '../../../../core/store.service';
import { Warehouse } from '../../models/warehouse.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { WarehouseService } from '../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-list',
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
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['warehouseCode', 'warehouseName', 'address', 'description', 'active', 'jsonData', 'actions']);
  showFilters = signal<boolean>(true);
  showFilterValue = true; // Regular property for @Input binding
  
  // Table-level flag: whether the table supports filtering
  tableFilterable = true;
  
  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Warehouse>[]>([]);
  
  // Template references for custom cells
  @ViewChild('activeCell') activeCellTemplate?: TemplateRef<any>;
  @ViewChild('jsonDataCell') jsonDataCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;
  
  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Warehouse>;

  private store = inject(StoreService);
  private warehouseService = inject(WarehouseService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  warehouses = this.store.select('warehouses');
  
  constructor() {
    // Reinitialize columns when warehouses change (using effect)
    effect(() => {
      // Access signal to create dependency
      this.warehouses();
      // Reinitialize columns if templates are available
      if (this.jsonDataCellTemplate) {
        this.initializeColumns();
      }
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  ngAfterViewInit(): void {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeColumns(): void {
    this.columns.set([
      {
        key: 'warehouseCode',
        header: this.languageService.instant('warehouseCode'),
        field: 'warehouseCode',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'warehouseName',
        header: this.languageService.instant('warehouseName'),
        field: 'warehouseName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'address',
        header: this.languageService.instant('address'),
        field: 'address',
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
        key: 'jsonData',
        header: this.languageService.instant('jsonData'),
        field: 'jsonData',
        sortable: false,
        filterable: false,
        cellTemplate: this.jsonDataCellTemplate
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

  loadWarehouses(): void {
    this.warehouseService.loadWarehouses(this.isLoading);
  }

  openAddWarehouseDialog(): void {
    this.warehouseService.openAddWarehouseDialog(this.isLoading);
  }

  openEditWarehouseDialog(warehouse: Warehouse): void {
    this.warehouseService.openEditWarehouseDialog(warehouse, this.isLoading);
  }

  deleteWarehouse(warehouse: Warehouse): void {
    this.warehouseService.openDeleteWarehouseDialog(warehouse, this.isLoading);
  }

  goBack(): void {
    this.router.navigate(['/master']);
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
}

