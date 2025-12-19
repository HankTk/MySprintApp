import { Component, OnInit, inject, signal, effect, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit } from '@angular/core';
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
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { GeneralLedgerService } from '../../services/general-ledger.service';
import { GLEntry, GLEntryType } from '../../models/general-ledger-entry.model';

@Component({
  selector: 'app-general-ledger-list',
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
    AxTooltipDirective,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './general-ledger-list.component.html',
  styleUrls: ['./general-ledger-list.component.scss']
})
export class GeneralLedgerListComponent implements OnInit, AfterViewInit {
  isLoading = signal<boolean>(false);
  glEntries = signal<GLEntry[]>([]);
  showFilters = signal<boolean>(true);
  showFilterValue = true; // Regular property for @Input binding
  
  // Table-level flag: whether the table supports filtering
  tableFilterable = true;
  
  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<GLEntry>[]>([]);
  
  // Template references for custom cells
  @ViewChild('dateCell') dateCellTemplate?: TemplateRef<any>;
  @ViewChild('typeCell') typeCellTemplate?: TemplateRef<any>;
  @ViewChild('orderPoInvoiceCell') orderPoInvoiceCellTemplate?: TemplateRef<any>;
  @ViewChild('quantityCell') quantityCellTemplate?: TemplateRef<any>;
  @ViewChild('debitCell') debitCellTemplate?: TemplateRef<any>;
  @ViewChild('creditCell') creditCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;
  
  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<GLEntry>;

  displayedColumns = signal<string[]>(['date', 'type', 'orderPoInvoice', 'customerSupplier', 'description', 'quantity', 'debit', 'credit', 'actions']);

  private glService = inject(GeneralLedgerService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      // Access signal to create dependency
      this.glEntries();
      // Reinitialize columns if templates are available
      if (this.typeCellTemplate) {
        this.initializeColumns();
      }
    });
  }

  ngOnInit(): void {
    this.loadGLEntries();
  }

  ngAfterViewInit(): void {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  loadGLEntries(): void {
    this.isLoading.set(true);
    this.glService.getGLEntries().subscribe({
      next: (entries) => {
        this.glEntries.set(entries);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading GL entries:', error);
        this.isLoading.set(false);
      }
    });
  }

  private initializeColumns(): void {
    this.columns.set([
      {
        key: 'date',
        header: this.languageService.instant('generalLedger.table.date'),
        field: 'date',
        sortable: true,
        filterable: true,
        filterType: 'date-range',
        cellTemplate: this.dateCellTemplate
      },
      {
        key: 'type',
        header: this.languageService.instant('generalLedger.table.type'),
        field: 'type',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { value: '', label: 'All' },
          { value: 'REVENUE', label: this.languageService.instant('generalLedger.type.revenue') },
          { value: 'COST', label: this.languageService.instant('generalLedger.type.cost') },
          { value: 'EXPENSE', label: this.languageService.instant('generalLedger.type.expense') },
          { value: 'ACCOUNTS_PAYABLE', label: this.languageService.instant('generalLedger.type.accountsPayable') },
          { value: 'PAYMENT', label: this.languageService.instant('generalLedger.type.payment') }
        ],
        cellTemplate: this.typeCellTemplate
      },
      {
        key: 'orderPoInvoice',
        header: this.languageService.instant('generalLedger.table.orderPoInvoice'),
        field: 'orderNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        cellTemplate: this.orderPoInvoiceCellTemplate
      },
      {
        key: 'customerSupplier',
        header: this.languageService.instant('generalLedger.table.customerSupplier'),
        field: 'customerName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value, row) => row.customerName || row.supplierName || '-'
      },
      {
        key: 'description',
        header: this.languageService.instant('generalLedger.table.description'),
        field: 'description',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'quantity',
        header: this.languageService.instant('generalLedger.table.quantity'),
        field: 'quantity',
        sortable: true,
        filterable: false,
        align: 'right',
        cellTemplate: this.quantityCellTemplate
      },
      {
        key: 'debit',
        header: this.languageService.instant('generalLedger.table.debit'),
        field: 'amount',
        sortable: true,
        filterable: false,
        align: 'right',
        cellTemplate: this.debitCellTemplate
      },
      {
        key: 'credit',
        header: this.languageService.instant('generalLedger.table.credit'),
        field: 'amount',
        sortable: true,
        filterable: false,
        align: 'right',
        cellTemplate: this.creditCellTemplate
      },
      {
        key: 'actions',
        header: this.languageService.instant('generalLedger.table.actions'),
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  getTypeColor(type: GLEntryType): string {
    return this.glService.getTypeColor(type);
  }

  getTypeBackgroundColor(type: GLEntryType): string {
    return this.glService.getTypeBackgroundColor(type);
  }

  getTypeLabel(type: GLEntryType): string {
    return this.glService.getTypeLabel(type);
  }

  getDebitAmount(entry: GLEntry): number {
    return (entry.type === 'COST' || entry.type === 'EXPENSE' || entry.type === 'ACCOUNTS_PAYABLE') ? entry.amount : 0;
  }

  getCreditAmount(entry: GLEntry): number {
    return (entry.type === 'REVENUE' || entry.type === 'PAYMENT') ? entry.amount : 0;
  }

  viewEntry(entry: GLEntry): void {
    if (entry.orderId) {
      this.router.navigate(['/orders', entry.orderId]);
    } else if (entry.poId) {
      this.router.navigate(['/purchase-orders', entry.poId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Get filtered entries from table (ax-table handles filtering internally)
  get filteredEntries(): GLEntry[] {
    // The table handles filtering internally, so we use glEntries
    // The summary will show totals for all entries (filtering is handled by table display)
    return this.glEntries();
  }

  // Calculate totals (using all entries - table handles filtering for display)
  get totalDebit(): number {
    return this.filteredEntries.filter(e => e.type === 'COST' || e.type === 'EXPENSE' || e.type === 'ACCOUNTS_PAYABLE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalCredit(): number {
    return this.filteredEntries.filter(e => e.type === 'REVENUE' || e.type === 'PAYMENT')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalRevenue(): number {
    return this.filteredEntries.filter(e => e.type === 'REVENUE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalCost(): number {
    return this.filteredEntries.filter(e => e.type === 'COST')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalExpense(): number {
    return this.filteredEntries.filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalAccountsPayable(): number {
    return this.filteredEntries.filter(e => e.type === 'ACCOUNTS_PAYABLE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalPayment(): number {
    return this.filteredEntries.filter(e => e.type === 'PAYMENT')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get netIncome(): number {
    return this.totalRevenue - this.totalCost - this.totalExpense;
  }
}

