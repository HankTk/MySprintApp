import { Component, OnInit, inject, OnDestroy, signal, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../../core/store.service';
import { Vendor } from '../../models/vendor.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { VendorService } from '../../services/vendor.service';
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
  selector: 'app-vendor-list',
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
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['vendorNumber', 'companyName', 'lastName', 'firstName', 'email', 'phone', 'jsonData', 'actions']);
  showFilters = signal<boolean>(true);
  showFilterValue = true; // Regular property for @Input binding
  
  // Table-level flag: whether the table supports filtering
  tableFilterable = true;
  
  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Vendor>[]>([]);
  
  // Template references for custom cells
  @ViewChild('jsonDataCell') jsonDataCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;
  
  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Vendor>;

  private store = inject(StoreService);
  private vendorService = inject(VendorService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  vendors = this.store.select('vendors');
  
  constructor() {
    // Reinitialize columns when vendors change (using effect)
    effect(() => {
      // Access signal to create dependency
      this.vendors();
      // Reinitialize columns if templates are available
      if (this.jsonDataCellTemplate) {
        this.initializeColumns();
      }
    });
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  ngAfterViewInit(): void {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeColumns(): void {
    const isEnglish = this.languageService.isEnglish();
    this.columns.set([
      {
        key: 'vendorNumber',
        header: this.languageService.instant('vendorNumber'),
        field: 'vendorNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'companyName',
        header: this.languageService.instant('companyName'),
        field: 'companyName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: isEnglish ? 'firstName' : 'lastName',
        header: this.languageService.instant(isEnglish ? 'firstName' : 'lastName'),
        field: isEnglish ? 'firstName' : 'lastName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: isEnglish ? 'lastName' : 'firstName',
        header: this.languageService.instant(isEnglish ? 'lastName' : 'firstName'),
        field: isEnglish ? 'lastName' : 'firstName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'email',
        header: this.languageService.instant('emailAddress'),
        field: 'email',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'phone',
        header: this.languageService.instant('phone'),
        field: 'phone',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
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

  loadVendors(): void {
    this.vendorService.loadVendors(this.isLoading);
  }

  openAddVendorDialog(): void {
    this.vendorService.openAddVendorDialog(this.isLoading);
  }

  openEditVendorDialog(vendor: Vendor): void {
    this.vendorService.openEditVendorDialog(vendor, this.isLoading);
  }

  deleteVendor(vendor: Vendor): void {
    this.vendorService.openDeleteVendorDialog(vendor, this.isLoading);
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
