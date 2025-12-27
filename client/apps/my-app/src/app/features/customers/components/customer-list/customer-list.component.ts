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
import {CommonModule} from '@angular/common';
import {StoreService} from '../../../../core/store.service';
import {Customer} from '../../models/customer.model';
import {TranslateModule} from '@ngx-translate/core';
import {LanguageService} from '../../../../shared/services/language.service';
import {Subscription} from 'rxjs';
import {JsonUtil} from '../../../../shared/utils/json.util';
import {CustomerService} from '../../services/customer.service';
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

@Component({
  selector: 'app-customer-list',
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
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['customerNumber', 'companyName', 'lastName', 'firstName', 'email', 'phone', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<Customer>[]>([]);

  // Template references for custom cells

  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<Customer>;

  private store = inject(StoreService);
  private customerService = inject(CustomerService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  customers = this.store.select('customers');

  constructor()
  {
    // Reinitialize columns when customers change (using effect)
    effect(() =>
    {
      // Access signal to create dependency
      this.customers();
      // Reinitialize columns if templates are available

    });
  }

  ngOnInit(): void
  {
    this.loadCustomers();
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
    const isEnglish = this.languageService.isEnglish();
    this.columns.set([
      {
        key: 'customerNumber',
        header: this.languageService.instant('customerNumber'),
        field: 'customerNumber',
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
        key: 'actions',
        header: this.languageService.instant('actions'),
        field: 'id',
        sortable: false,
        filterable: false,
        cellTemplate: this.actionsCellTemplate
      }
    ]);
  }

  loadCustomers(): void
  {
    this.customerService.loadCustomers(this.isLoading);
  }

  openAddCustomerDialog(): void
  {
    this.customerService.openAddCustomerDialog(this.isLoading);
  }

  openEditCustomerDialog(customer: Customer): void
  {
    this.customerService.openEditCustomerDialog(customer, this.isLoading);
  }

  deleteCustomer(customer: Customer): void
  {
    this.customerService.openDeleteCustomerDialog(customer, this.isLoading);
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
