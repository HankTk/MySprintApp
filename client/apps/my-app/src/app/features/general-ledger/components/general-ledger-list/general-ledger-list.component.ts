import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { 
  AxButtonComponent, 
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
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
export class GeneralLedgerListComponent implements OnInit {
  isLoading = signal<boolean>(false);
  glEntries = signal<GLEntry[]>([]);
  filteredEntries = signal<GLEntry[]>([]);
  typeFilter = signal<GLEntryType | null>(null);
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);

  displayedColumns = signal<string[]>(['date', 'type', 'orderPoInvoice', 'customerSupplier', 'description', 'quantity', 'debit', 'credit', 'actions']);

  private glService = inject(GeneralLedgerService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadGLEntries();
  }

  loadGLEntries(): void {
    this.isLoading.set(true);
    this.glService.getGLEntries().subscribe({
      next: (entries) => {
        this.glEntries.set(entries);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading GL entries:', error);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let entries = [...this.glEntries()];
    
    if (this.typeFilter()) {
      entries = entries.filter(e => e.type === this.typeFilter());
    }
    
    if (this.dateFrom()) {
      const fromDateStr = this.dateFrom()!.toISOString().split('T')[0];
      entries = entries.filter(e => e.date >= fromDateStr);
    }
    
    if (this.dateTo()) {
      const toDateStr = this.dateTo()!.toISOString().split('T')[0];
      entries = entries.filter(e => e.date <= toDateStr);
    }
    
    this.filteredEntries.set(entries);
  }

  onTypeFilterChange(value: string | null): void {
    this.typeFilter.set(value as GLEntryType | null);
  }

  onDateFromChange(date: Date | null): void {
    this.dateFrom.set(date);
  }

  onDateToChange(date: Date | null): void {
    this.dateTo.set(date);
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
      this.router.navigate(['/orders'], { queryParams: { id: entry.orderId } });
    } else if (entry.poId) {
      this.router.navigate(['/purchase-orders'], { queryParams: { id: entry.poId } });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Calculate totals
  get totalDebit(): number {
    return this.filteredEntries().filter(e => e.type === 'COST' || e.type === 'EXPENSE' || e.type === 'ACCOUNTS_PAYABLE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalCredit(): number {
    return this.filteredEntries().filter(e => e.type === 'REVENUE' || e.type === 'PAYMENT')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalRevenue(): number {
    return this.filteredEntries().filter(e => e.type === 'REVENUE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalCost(): number {
    return this.filteredEntries().filter(e => e.type === 'COST')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalExpense(): number {
    return this.filteredEntries().filter(e => e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalAccountsPayable(): number {
    return this.filteredEntries().filter(e => e.type === 'ACCOUNTS_PAYABLE')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get totalPayment(): number {
    return this.filteredEntries().filter(e => e.type === 'PAYMENT')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get netIncome(): number {
    return this.totalRevenue - this.totalCost - this.totalExpense;
  }
}

