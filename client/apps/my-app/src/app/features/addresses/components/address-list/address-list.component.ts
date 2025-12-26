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
import { Address } from '../../models/address.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['addressType', 'streetAddress1', 'city', 'state', 'postalCode', 'country', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Address>[]>([]);

  // Template references for custom cells
  @ViewChild('addressTypeCell') addressTypeCellTemplate?: TemplateRef<any>;

  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Address>;

  private store = inject(StoreService);
  private addressService = inject(AddressService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  addresses = this.store.select('addresses');

  constructor()
  {
    // Reinitialize columns when addresses change (using effect)
    effect(() =>
    {
      // Access signal to create dependency
      this.addresses();
      // Reinitialize columns if templates are available

    });
  }

  ngOnInit(): void
  {
    this.loadAddresses();
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
        key: 'addressType',
        header: this.languageService.instant('addressType'),
        field: 'addressType',
        sortable: true,
        filterable: true,
        filterType: 'text',
        cellTemplate: this.addressTypeCellTemplate
      },
      {
        key: 'streetAddress1',
        header: this.languageService.instant('streetAddress1'),
        field: 'streetAddress1',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'city',
        header: this.languageService.instant('city'),
        field: 'city',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'state',
        header: this.languageService.instant('state'),
        field: 'state',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'postalCode',
        header: this.languageService.instant('postalCode'),
        field: 'postalCode',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'country',
        header: this.languageService.instant('country'),
        field: 'country',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
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

  loadAddresses(): void
  {
    this.addressService.loadAddresses(this.isLoading);
  }

  openAddAddressDialog(): void
  {
    this.addressService.openAddAddressDialog(this.isLoading);
  }

  openEditAddressDialog(address: Address): void
  {
    this.addressService.openEditAddressDialog(address, this.isLoading);
  }

  deleteAddress(address: Address): void
  {
    this.addressService.openDeleteAddressDialog(address, this.isLoading);
  }

  goBack(): void
  {
    this.router.navigate(['/master']);
  }

  getAddressTypeLabel(addressType?: string): string
  {
    if (!addressType) return '-';
    const key = addressType.toLowerCase();
    return this.translate.instant(key) || addressType;
  }
}

