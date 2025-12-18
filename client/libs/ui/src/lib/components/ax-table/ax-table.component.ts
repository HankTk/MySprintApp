import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, OnChanges, SimpleChanges, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AxSelectComponent, AxSelectOption } from '../ax-select/ax-select.component';
import { AxDateRangePickerComponent } from '../ax-date-range-picker/ax-date-range-picker.component';

/**
 * Filter type for column filtering
 */
export type FilterType = 'text' | 'select' | 'date-range' | 'autocomplete';

/**
 * Filter option for select/autocomplete filters
 */
export interface FilterOption {
  value: any;
  label: string;
}

/**
 * Column definition interface for table columns
 */
export interface AxTableColumnDef<T = any> {
  /** Unique identifier for the column */
  key: string;
  /** Display header text */
  header: string;
  /** Property path to access data (supports nested properties like 'user.name') */
  field?: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Filter type: 'text' (default), 'select', 'date-range', or 'autocomplete' */
  filterType?: FilterType;
  /** Filter options for select/autocomplete filters */
  filterOptions?: FilterOption[] | ((data: T[]) => FilterOption[]);
  /** Custom cell template */
  cellTemplate?: TemplateRef<any>;
  /** Custom header template */
  headerTemplate?: TemplateRef<any>;
  /** Custom value formatter function */
  formatter?: (value: any, row: T) => string;
  /** Column width */
  width?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Selection mode for table rows
 */
export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * Reusable table component
 * Provides consistent table styling and functionality
 * 
 * Features:
 * - Column definitions with customizable headers, fields, and templates
 * - Sorting (per column)
 * - Filtering (per column)
 * - Pagination
 * - Row selection (none, single, multiple)
 * 
 * Supports two modes:
 * 1. Simple mode: Pass dataSource and columns, use rowTemplate for custom cells
 * 2. Pass-through mode: Set passThrough=true and use ng-content for full mat-table control
 */
@Component({
  selector: 'ax-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AxSelectComponent,
    AxDateRangePickerComponent
  ],
  templateUrl: './ax-table.component.html',
  styleUrls: ['./ax-table.component.scss'],
  exportAs: 'axTable'
})
export class AxTableComponent<T = any> implements OnInit, OnChanges {
  /** Table data source */
  @Input() dataSource: T[] = [];
  
  /** Column definitions - preferred way to define columns */
  @Input() columns: AxTableColumnDef<T>[] = [];
  
  /** Legacy: Simple string array of column keys (for backward compatibility) */
  @Input() displayedColumns: string[] = [];
  
  /** Page size */
  @Input() pageSize = 10;
  
  /** Page size options */
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  
  /** Show paginator */
  @Input() showPaginator = true;
  
  /** Enable sorting */
  @Input() showSort = true;
  
  /** Enable filtering */
  @Input() showFilter = false;
  
  /** Selection mode: 'none', 'single', or 'multiple' */
  @Input() selectionMode: SelectionMode = 'none';
  
  /** Pass-through mode for full control */
  @Input() passThrough = false;
  
  /** Unique identifier field for row selection (default: 'id') */
  @Input() trackBy: string | ((row: T) => any) = 'id';

  /** Event emitted when selection changes */
  @Output() selectionChange = new EventEmitter<T[]>();
  
  /** Event emitted when a single row is selected (for single selection mode) */
  @Output() rowSelect = new EventEmitter<T>();

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<any>;
  @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  currentPage = 0;
  currentPageSize = 10;
  sortedData: T[] = [];
  filteredData: T[] = [];
  activeSort?: Sort;
  columnFilters: { [key: string]: string | { start: Date | null; end: Date | null } | null } = {};
  dateRangeFilters: { [key: string]: { start: Date | null; end: Date | null } } = {};
  openDateRangePicker: { [key: string]: boolean } = {};
  selection = new SelectionModel<T>(true, []); // true = multiple selection

  /** Computed column definitions from inputs */
  computedColumns: AxTableColumnDef<T>[] = [];
  
  /** All column keys including selection column */
  allColumnKeys: string[] = [];

  ngOnInit(): void {
    this.currentPageSize = this.pageSize;
    this.initializeColumns();
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['displayedColumns']) {
      this.initializeColumns();
    }
    
    if (changes['dataSource'] || changes['pageSize'] || changes['selectionMode']) {
      if (changes['pageSize']) {
        this.currentPageSize = this.pageSize;
      }
      if (changes['selectionMode']) {
        this.selection = new SelectionModel<T>(
          this.selectionMode === 'multiple',
          []
        );
      }
      this.updateData();
    }
  }

  private initializeColumns(): void {
    if (this.columns && this.columns.length > 0) {
      // Use column definitions
      this.computedColumns = this.columns.map(col => ({
        key: col.key,
        header: col.header || col.key,
        field: col.field || col.key,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        filterType: col.filterType || 'text',
        filterOptions: col.filterOptions,
        cellTemplate: col.cellTemplate,
        headerTemplate: col.headerTemplate,
        formatter: col.formatter,
        width: col.width,
        align: col.align || 'left'
      }));
    } else if (this.displayedColumns && this.displayedColumns.length > 0) {
      // Legacy: Convert string array to column definitions
      this.computedColumns = this.displayedColumns.map(key => ({
        key,
        header: key,
        field: key,
        sortable: true,
        filterable: false
      }));
    }

    // Build column keys array (include selection column if needed)
    this.allColumnKeys = [];
    if (this.selectionMode !== 'none') {
      this.allColumnKeys.push('_select');
    }
    this.allColumnKeys.push(...this.computedColumns.map(col => col.key));
  }

  getFilterRowColumns(): string[] {
    const filterColumns: string[] = [];
    if (this.selectionMode !== 'none') {
      filterColumns.push('_select');
    }
    filterColumns.push(...this.computedColumns.map(col => col.key + '_filter'));
    return filterColumns;
  }

  private updateData(): void {
    this.sortedData = [...this.dataSource];
    this.applyFilters();
    this.applySorting();
  }

  private applyFilters(): void {
    this.filteredData = this.sortedData.filter(row => {
      return this.computedColumns.every(col => {
        if (!col.filterable || !this.columnFilters[col.key]) {
          return true;
        }
        
        const filterValue = this.columnFilters[col.key];
        const cellValue = this.getCellValue(row, col);
        const filterType = col.filterType || 'text';
        
        // Handle date range filter
        if (filterType === 'date-range' && typeof filterValue === 'object' && filterValue !== null) {
          const dateRange = filterValue as { start: Date | null; end: Date | null };
          if (!dateRange.start && !dateRange.end) {
            return true;
          }
          
          // Handle string dates (ISO format or date-only format)
          let cellDate: Date | null = null;
          if (cellValue) {
            if (typeof cellValue === 'string') {
              // If it's a date-only string (YYYY-MM-DD), parse it properly
              const dateStr = cellValue.split('T')[0]; // Get date part if ISO string
              cellDate = new Date(dateStr);
            } else if (cellValue instanceof Date) {
              cellDate = cellValue;
            }
          }
          
          if (!cellDate || isNaN(cellDate.getTime())) {
            return false;
          }
          
          // Compare dates (ignore time for date-only comparisons)
          const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          const startMatch = !dateRange.start || cellDateOnly >= new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate());
          const endMatch = !dateRange.end || cellDateOnly <= new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate());
          return startMatch && endMatch;
        }
        
        // Handle text, select, and autocomplete filters
        if (typeof filterValue === 'string') {
          // Empty string means "show all"
          if (filterValue === '') {
            return true;
          }
          
          if (filterType === 'select' || filterType === 'autocomplete') {
            // Exact match for select/autocomplete
            return String(cellValue) === filterValue;
          } else {
            // Text filter - contains match
            return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
          }
        }
        
        return true;
      });
    });
  }

  private applySorting(): void {
    if (this.activeSort && this.activeSort.direction) {
      const column = this.computedColumns.find(col => col.key === this.activeSort!.active);
      if (column && column.sortable) {
        this.filteredData.sort((a, b) => {
          const aValue = this.getCellValue(a, column);
          const bValue = this.getCellValue(b, column);
          
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return 1;
          if (bValue == null) return -1;
        
        if (aValue < bValue) {
          return this.activeSort!.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return this.activeSort!.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    }
  }

  getCellValue(row: T, column: AxTableColumnDef<T>): any {
    if (!column.field) return null;
    
    // Support nested properties like 'user.name'
    const fields = column.field.split('.');
    let value: any = row;
    for (const field of fields) {
      value = value?.[field];
      if (value == null) break;
    }
    return value;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentPageSize = event.pageSize;
  }

  onSortChange(sort: Sort): void {
    this.activeSort = sort;
    this.applySorting();
  }

  onFilterChange(columnKey: string, value: string | { start: Date | null; end: Date | null } | null): void {
    this.columnFilters[columnKey] = value;
    if (typeof value === 'object' && value !== null && 'start' in value) {
      this.dateRangeFilters[columnKey] = value as { start: Date | null; end: Date | null };
    }
    this.currentPage = 0; // Reset to first page when filtering
    this.applyFilters();
    this.applySorting();
  }

  onDateRangeChange(columnKey: string, dateRange: { start: Date | null; end: Date | null }): void {
    this.columnFilters[columnKey] = dateRange;
    this.dateRangeFilters[columnKey] = dateRange;
    this.currentPage = 0;
    this.applyFilters();
    this.applySorting();
  }

  onDateRangeStartChange(columnKey: string, event: MatDatepickerInputEvent<Date>, endDate: Date | null): void {
    this.onDateRangeChange(columnKey, { start: event.value, end: endDate });
  }

  onDateRangeEndChange(columnKey: string, startDate: Date | null, event: MatDatepickerInputEvent<Date>): void {
    this.onDateRangeChange(columnKey, { start: startDate, end: event.value });
  }

  onDateRangeStartDateChange(columnKey: string, date: Date | null): void {
    const endDate = this.dateRangeFilters[columnKey]?.end || null;
    this.onDateRangeChange(columnKey, { start: date, end: endDate });
  }

  onDateRangeEndDateChange(columnKey: string, date: Date | null): void {
    const startDate = this.dateRangeFilters[columnKey]?.start || null;
    this.onDateRangeChange(columnKey, { start: startDate, end: date });
  }

  clearFilters(): void {
    this.columnFilters = {};
    this.dateRangeFilters = {};
    this.currentPage = 0;
    this.applyFilters();
    this.applySorting();
  }

  getFilterOptions(column: AxTableColumnDef<T>): FilterOption[] {
    if (!column.filterOptions) {
      return [];
    }
    
    if (Array.isArray(column.filterOptions)) {
      return column.filterOptions;
    }
    
    if (typeof column.filterOptions === 'function') {
      return column.filterOptions(this.dataSource);
    }
    
    return [];
  }

  getFilterDisplayFn(column: AxTableColumnDef<T>): (value: any) => string {
    return (value: any) => {
      const options = this.getFilterOptions(column);
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value || '';
    };
  }

  getFilterValue(columnKey: string): string {
    const value = this.columnFilters[columnKey];
    return typeof value === 'string' ? value : '';
  }

  getDateRangeDisplay(columnKey: string): string {
    const range = this.dateRangeFilters[columnKey];
    if (!range || (!range.start && !range.end)) {
      return '';
    }
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      return date.toLocaleDateString();
    };
    const start = formatDate(range.start);
    const end = formatDate(range.end);
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `From ${start}`;
    } else if (end) {
      return `Until ${end}`;
    }
    return '';
  }

  toggleDateRangePicker(columnKey: string): void {
    // Initialize date range if it doesn't exist
    if (!this.dateRangeFilters[columnKey]) {
      this.dateRangeFilters[columnKey] = { start: null, end: null };
    }
    this.openDateRangePicker[columnKey] = !this.openDateRangePicker[columnKey];
  }

  closeDateRangePicker(columnKey: string): void {
    this.openDateRangePicker[columnKey] = false;
  }

  clearDateRange(columnKey: string): void {
    this.dateRangeFilters[columnKey] = { start: null, end: null };
    this.columnFilters[columnKey] = { start: null, end: null };
    this.openDateRangePicker[columnKey] = false;
    this.currentPage = 0;
    this.applyFilters();
    this.applySorting();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close date range pickers when clicking outside
    const target = event.target as HTMLElement;
    const isDateRangeInput = target.closest('.date-range-single-wrapper');
    const isDateRangePopup = target.closest('.date-range-popup');
    const isDateRangePicker = target.closest('ax-date-range-picker');
    const isDatePicker = target.closest('.mat-datepicker-popup') || 
                        target.closest('.mat-calendar') || 
                        target.closest('.cdk-overlay-container') ||
                        target.closest('.cdk-overlay-pane');
    const isDatePickerToggle = target.closest('.mat-datepicker-toggle');
    const isDatePickerInput = target.closest('input[matDatepicker]');
    const isDatePickerContainer = target.closest('.ax-date-range-picker-container');
    
    // Don't close if clicking on datepicker elements or inside popup - allow datepicker to open
    if (isDatePickerToggle || 
        isDatePickerInput || 
        isDateRangePopup || 
        isDateRangePicker || 
        isDatePicker || 
        isDatePickerContainer) {
      return;
    }
    
    if (!isDateRangeInput) {
      Object.keys(this.openDateRangePicker).forEach(key => {
        this.openDateRangePicker[key] = false;
      });
    }
  }


  /** Whether the number of selected elements matches the total number of rows */
  isAllSelected(): boolean {
    if (this.selectionMode !== 'multiple') return false;
    const numSelected = this.selection.selected.length;
    const numRows = this.paginatedData.length;
    return numSelected === numRows && numRows > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection */
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.paginatedData.forEach(row => this.selection.select(row));
    }
    this.emitSelection();
  }

  /** Toggle row selection */
  toggleRow(row: T): void {
    if (this.selectionMode === 'single') {
      this.selection.clear();
      this.selection.select(row);
      this.rowSelect.emit(row);
    } else if (this.selectionMode === 'multiple') {
      this.selection.toggle(row);
    }
    this.emitSelection();
  }

  /** Check if row is selected */
  isSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  private emitSelection(): void {
    this.selectionChange.emit(this.selection.selected);
  }

  get paginatedData(): T[] {
    const start = this.currentPage * this.currentPageSize;
    const end = start + this.currentPageSize;
    return this.filteredData.slice(start, end);
  }

  get totalFilteredCount(): number {
    return this.filteredData.length;
  }
}

// Re-export Material Table module for pass-through usage
export { MatTableModule } from '@angular/material/table';
