import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, OnChanges, SimpleChanges, OnInit, HostListener, ChangeDetectorRef, inject, ViewChild, ElementRef, OnDestroy, ViewContainerRef } from '@angular/core';
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
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { PortalModule } from '@angular/cdk/portal';
import { AxSelectComponent, AxSelectOption } from '../ax-select/ax-select.component';

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
    OverlayModule,
    PortalModule,
    AxSelectComponent
  ],
  templateUrl: './ax-table.component.html',
  styleUrls: ['./ax-table.component.scss'],
  exportAs: 'axTable'
})
export class AxTableComponent<T = any> implements OnInit, OnChanges, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private overlayRefs: { [key: string]: OverlayRef } = {};
  currentOverlayColumnKey: string | null = null;
  
  @ViewChild('dateRangePopupTemplate', { read: TemplateRef }) dateRangePopupTemplate?: TemplateRef<any>;
  
  getTempStartDate(columnKey: string): Date | null {
    return this.tempDateRangeFilters[columnKey]?.start ?? this.dateRangeFilters[columnKey]?.start ?? null;
  }
  
  getTempEndDate(columnKey: string): Date | null {
    return this.tempDateRangeFilters[columnKey]?.end ?? this.dateRangeFilters[columnKey]?.end ?? null;
  }
  
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
  
  /** Whether the table supports filtering (table-level flag) */
  @Input() filterable = false;
  
  /** Whether to show the filter row (controlled by show/hide button) */
  private _showFilter: boolean | undefined = undefined;
  
  @Input() 
  set showFilter(value: boolean) {
    const oldValue = this._showFilter;
    // Only log and process if value actually changed
    if (oldValue !== value) {
      console.log('[AxTable] showFilter setter called:', oldValue, '->', value);
      this._showFilter = value;
      console.log('[AxTable] showFilter changed in setter, triggering change detection');
      // Reinitialize columns to ensure filter column definitions are updated
      if (this.filterable) {
        this.initializeColumns();
      }
      this.cdr.markForCheck();
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
      });
    } else {
      // Value didn't change, just update internal value silently
      this._showFilter = value;
    }
  }
  
  get showFilter(): boolean {
    return this._showFilter ?? false;
  }
  
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
  tempDateRangeFilters: { [key: string]: { start: Date | null; end: Date | null } } = {};
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
    console.log('[AxTable] ngOnInit - filterable:', this.filterable, 'showFilter:', this.showFilter, 'should show:', this.filterable && this.showFilter);
    console.log('[AxTable] ngOnInit - showFilter type:', typeof this.showFilter, 'value:', this.showFilter);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['displayedColumns']) {
      this.initializeColumns();
    }
    
    if (changes['filterable']) {
      console.log('[AxTable] filterable changed:', changes['filterable'].currentValue);
      this.cdr.markForCheck();
    }
    
    if (changes['showFilter']) {
      const prevValue = changes['showFilter'].previousValue;
      const currValue = changes['showFilter'].currentValue;
      console.log('[AxTable] showFilter changed:', prevValue, '->', currValue);
      console.log('[AxTable] showFilter changed - prevValue type:', typeof prevValue, 'currValue type:', typeof currValue);
      console.log('[AxTable] filterable:', this.filterable, 'showFilter:', this.showFilter);
      console.log('[AxTable] Should show filter row:', this.filterable && this.showFilter);
      console.log('[AxTable] getFilterRowColumns().length:', this.getFilterRowColumns().length);
      
      // Reinitialize columns to ensure filter column definitions are updated
      if (this.filterable) {
        this.initializeColumns();
      }
      
      // Force change detection when showFilter changes
      this.cdr.markForCheck();
      // Use requestAnimationFrame to ensure DOM update happens after change detection
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
        console.log('[AxTable] After change detection - showFilter:', this.showFilter);
      });
    } else {
      // Log when showFilter is checked but not changed
      console.log('[AxTable] ngOnChanges called but showFilter not in changes. Current showFilter:', this.showFilter);
      console.log('[AxTable] All changes:', Object.keys(changes));
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
    // Always return filter columns if filtering is enabled (visibility controlled by CSS)
    if (!this.filterable) {
      return [];
    }
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
    // Debug: log all active filters
    console.log('[Date Filter] applyFilters called, active filters:', JSON.stringify(this.columnFilters, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }));
    
    this.filteredData = this.sortedData.filter(row => {
      return this.computedColumns.every(col => {
        if (!col.filterable) {
          return true;
        }
        
        const filterValue = this.columnFilters[col.key];
        const filterType = col.filterType || 'text';
        
        // For date-range, check if filter exists and has at least one date
        if (filterType === 'date-range') {
          if (!filterValue || (typeof filterValue === 'object' && !(filterValue as any).start && !(filterValue as any).end)) {
            return true; // No filter applied
          }
        } else if (!filterValue) {
          return true; // No filter applied
        }
        
        const cellValue = this.getCellValue(row, col);
        
        // Handle date range filter
        if (filterType === 'date-range' && typeof filterValue === 'object' && filterValue !== null) {
          const dateRange = filterValue as { start: Date | null; end: Date | null };
          if (!dateRange.start && !dateRange.end) {
            return true; // No filter applied
          }
          
          // Ensure dates are Date objects (they might have been serialized)
          let startDate: Date | null = null;
          let endDate: Date | null = null;
          
          if (dateRange.start) {
            if (dateRange.start instanceof Date) {
              startDate = new Date(dateRange.start.getTime());
            } else {
              startDate = new Date(dateRange.start);
            }
          }
          
          if (dateRange.end) {
            if (dateRange.end instanceof Date) {
              endDate = new Date(dateRange.end.getTime());
            } else {
              endDate = new Date(dateRange.end);
            }
          }
          
          // Debug: log filter values (only once per column to avoid spam)
          if (row === this.sortedData[0]) {
            console.log(`[Date Filter] Filter active for column ${col.key}:`, {
              filterValue,
              startDate: startDate?.toLocaleDateString(),
              endDate: endDate?.toLocaleDateString(),
              startDateObj: startDate,
              endDateObj: endDate
            });
          }
          
          // Handle different date formats from cell value
          let cellDate: Date | null = null;
          if (cellValue) {
            if (Array.isArray(cellValue)) {
              // Handle array format [year, month, day, hour, minute, second, nanoseconds]
              // Note: month is 0-indexed in JavaScript Date, but 1-indexed in the array
              if (cellValue.length >= 3) {
                const year = cellValue[0];
                const month = cellValue[1] - 1; // Convert to 0-indexed
                const day = cellValue[2];
                cellDate = new Date(year, month, day);
              }
            } else if (typeof cellValue === 'string') {
              // Parse ISO date string properly to avoid timezone issues
              // If it's an ISO string like "2025-12-18T11:56:47.154625", extract date parts
              if (cellValue.includes('T')) {
                const datePart = cellValue.split('T')[0]; // "2025-12-18"
                const [year, month, day] = datePart.split('-').map(Number);
                // Create date in local timezone to avoid UTC conversion issues
                cellDate = new Date(year, month - 1, day);
              } else {
                // Simple date string like "2025-12-18"
                const [year, month, day] = cellValue.split('-').map(Number);
                cellDate = new Date(year, month - 1, day);
              }
            } else if (cellValue instanceof Date) {
              cellDate = new Date(cellValue.getTime());
            } else if (typeof cellValue === 'number') {
              // Handle timestamp
              cellDate = new Date(cellValue);
            }
          }
          
          // If we can't parse the cell date, exclude this row
          if (!cellDate || isNaN(cellDate.getTime())) {
            // Debug: log when cell date can't be parsed
            console.debug(`[Date Filter] Cannot parse cell date for column ${col.key}:`, cellValue);
            return false;
          }
          
          // Compare dates (ignore time for date-only comparisons)
          // Normalize all dates to midnight (00:00:00) for accurate date-only comparison
          const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          const startDateOnly = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
          const endDateOnly = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;
          
          // Check if cell date is within range (inclusive on both ends)
          // startMatch: cell date must be >= start date (or no start date specified)
          // endMatch: cell date must be <= end date (or no end date specified)
          const startMatch = !startDateOnly || cellDateOnly.getTime() >= startDateOnly.getTime();
          const endMatch = !endDateOnly || cellDateOnly.getTime() <= endDateOnly.getTime();
          const matches = startMatch && endMatch;
          
          // Debug logging for all rows
          const cellTime = cellDateOnly.getTime();
          const startTime = startDateOnly ? startDateOnly.getTime() : null;
          const endTime = endDateOnly ? endDateOnly.getTime() : null;
          console.log(`[Date Filter] Row check - Column: ${col.key}, CellValue: ${JSON.stringify(cellValue)}, CellDate: ${cellDateOnly.toLocaleDateString()} (${cellTime}), Start: ${startDateOnly?.toLocaleDateString() || 'none'} (${startTime || 'none'}), End: ${endDateOnly?.toLocaleDateString() || 'none'} (${endTime || 'none'}), StartMatch: ${startMatch}, EndMatch: ${endMatch}, Matches: ${matches}, Result: ${matches ? 'INCLUDED' : 'EXCLUDED'}`);
          
          return matches;
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
    // Always update dateRangeFilters to preserve the selected dates for display
    this.dateRangeFilters[columnKey] = {
      start: dateRange.start ? new Date(dateRange.start) : null,
      end: dateRange.end ? new Date(dateRange.end) : null
    };
    
    // Only apply filter if at least one date is set
    if (dateRange.start || dateRange.end) {
      // Store a copy of the date range to ensure it's a proper object with Date instances
      const filterDateRange = {
        start: dateRange.start ? (dateRange.start instanceof Date ? new Date(dateRange.start.getTime()) : new Date(dateRange.start)) : null,
        end: dateRange.end ? (dateRange.end instanceof Date ? new Date(dateRange.end.getTime()) : new Date(dateRange.end)) : null
      };
      this.columnFilters[columnKey] = filterDateRange;
      console.log(`[Date Filter] Applied filter for ${columnKey}:`, {
        start: filterDateRange.start?.toISOString(),
        end: filterDateRange.end?.toISOString(),
        startType: typeof filterDateRange.start,
        endType: typeof filterDateRange.end
      });
    } else {
      // Clear filter if both dates are null
      delete this.columnFilters[columnKey];
      this.dateRangeFilters[columnKey] = { start: null, end: null };
      console.log(`[Date Filter] Cleared filter for ${columnKey}`);
    }
    this.currentPage = 0;
    this.applyFilters();
    this.applySorting();
    
    // Force change detection to update display
    this.cdr.detectChanges();
  }

  onDateRangeStartChange(columnKey: string, event: MatDatepickerInputEvent<Date>, endDate: Date | null): void {
    // Only update temp filters, don't apply yet
    if (!this.tempDateRangeFilters[columnKey]) {
      this.tempDateRangeFilters[columnKey] = { start: null, end: null };
    }
    this.tempDateRangeFilters[columnKey] = {
      start: event.value,
      end: endDate ?? this.tempDateRangeFilters[columnKey].end
    };
  }

  onDateRangeEndChange(columnKey: string, startDate: Date | null, event: MatDatepickerInputEvent<Date>): void {
    // Only update temp filters, don't apply yet
    if (!this.tempDateRangeFilters[columnKey]) {
      this.tempDateRangeFilters[columnKey] = { start: null, end: null };
    }
    this.tempDateRangeFilters[columnKey] = {
      start: startDate ?? this.tempDateRangeFilters[columnKey].start,
      end: event.value
    };
  }

  onDateRangeStartDateChange(columnKey: string, date: Date | null): void {
    // Store temporarily, don't apply filter yet
    const endDate = this.tempDateRangeFilters[columnKey]?.end || this.dateRangeFilters[columnKey]?.end || null;
    if (!this.tempDateRangeFilters[columnKey]) {
      this.tempDateRangeFilters[columnKey] = { start: null, end: null };
    }
    this.tempDateRangeFilters[columnKey] = { start: date, end: endDate };
  }

  onDateRangeEndDateChange(columnKey: string, date: Date | null): void {
    // Store temporarily, don't apply filter yet
    const startDate = this.tempDateRangeFilters[columnKey]?.start || this.dateRangeFilters[columnKey]?.start || null;
    if (!this.tempDateRangeFilters[columnKey]) {
      this.tempDateRangeFilters[columnKey] = { start: null, end: null };
    }
    this.tempDateRangeFilters[columnKey] = { start: startDate, end: date };
  }

  clearFilters(): void {
    this.columnFilters = {};
    this.dateRangeFilters = {};
    this.tempDateRangeFilters = {};
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

  toggleDateRangePicker(columnKey: string, event?: Event): void {
    // Close any other open pickers
    Object.keys(this.overlayRefs).forEach(key => {
      if (key !== columnKey && this.overlayRefs[key]?.hasAttached()) {
        this.closeDateRangePicker(key);
      }
    });

    // If already open, close it
    if (this.overlayRefs[columnKey]?.hasAttached()) {
      this.closeDateRangePicker(columnKey);
      return;
    }

    // Initialize date range if it doesn't exist
    if (!this.dateRangeFilters[columnKey]) {
      this.dateRangeFilters[columnKey] = { start: null, end: null };
    }
    // Initialize temp date range with current values
    if (!this.tempDateRangeFilters[columnKey]) {
      this.tempDateRangeFilters[columnKey] = { 
        start: this.dateRangeFilters[columnKey]?.start || null, 
        end: this.dateRangeFilters[columnKey]?.end || null 
      };
    }

    // Get the trigger element
    const triggerElement = event?.target ? (event.target as HTMLElement).closest('[data-column-key]')?.querySelector('.date-range-single-wrapper') as HTMLElement
      : document.querySelector(`[data-column-key="${columnKey}"] .date-range-single-wrapper`) as HTMLElement;

    if (!triggerElement) {
      console.error('Trigger element not found for column:', columnKey);
      return;
    }

    if (!this.dateRangePopupTemplate) {
      console.error('Date range popup template not found. Waiting for view initialization...');
      // Wait for next tick in case template isn't ready yet
      setTimeout(() => {
        if (this.dateRangePopupTemplate) {
          this.toggleDateRangePicker(columnKey, event);
        } else {
          console.error('Date range popup template still not found after delay');
        }
      }, 100);
      return;
    }

    // Create overlay position strategy
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4
        }
      ]);

    // Create overlay
    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'date-range-overlay-panel',
      disposeOnNavigation: true
    });

    // Set current column key for template context
    this.currentOverlayColumnKey = columnKey;

    // Attach template portal
    if (!this.dateRangePopupTemplate) {
      console.error('Date range popup template not found');
      return;
    }

    const portal = new TemplatePortal(this.dateRangePopupTemplate, this.viewContainerRef, {
      columnKey: columnKey
    });

    overlayRef.attach(portal);
    this.overlayRefs[columnKey] = overlayRef;
    this.openDateRangePicker[columnKey] = true;

    // Force change detection
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  closeDateRangePicker(columnKey: string): void {
    // Apply the temporary date range when closing
    const tempRange = this.tempDateRangeFilters[columnKey];
    if (tempRange && (tempRange.start || tempRange.end)) {
      // Ensure we have the latest temp values - apply the filter
      this.onDateRangeChange(columnKey, {
        start: tempRange.start,
        end: tempRange.end
      });
    } else if (tempRange && !tempRange.start && !tempRange.end) {
      // Both dates are null - clear the filter
      this.onDateRangeChange(columnKey, { start: null, end: null });
    } else {
      // If no temp values, use current values (in case user didn't change anything)
      const currentRange = this.dateRangeFilters[columnKey];
      if (currentRange && (currentRange.start || currentRange.end)) {
        this.onDateRangeChange(columnKey, currentRange);
      }
    }
    
    // Close overlay
    if (this.overlayRefs[columnKey]) {
      this.overlayRefs[columnKey].dispose();
      delete this.overlayRefs[columnKey];
    }
    
    this.openDateRangePicker[columnKey] = false;
    
    // Force change detection to update the display
    this.cdr.detectChanges();
  }

  clearDateRange(columnKey: string): void {
    this.dateRangeFilters[columnKey] = { start: null, end: null };
    this.tempDateRangeFilters[columnKey] = { start: null, end: null };
    this.columnFilters[columnKey] = { start: null, end: null };
    this.openDateRangePicker[columnKey] = false;
    
    // Close overlay if open
    if (this.overlayRefs[columnKey]) {
      this.overlayRefs[columnKey].dispose();
      delete this.overlayRefs[columnKey];
    }
    
    this.currentPage = 0;
    this.applyFilters();
    this.applySorting();
  }

  ngOnDestroy(): void {
    // Clean up all overlays
    Object.keys(this.overlayRefs).forEach(key => {
      if (this.overlayRefs[key]?.hasAttached()) {
        this.overlayRefs[key].dispose();
      }
    });
    this.overlayRefs = {};
  }

  private datePickerToggleClicked = false;

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    // Check if mousedown is on datepicker toggle
    const target = event.target as HTMLElement;
    const isDatePickerToggle = target.closest('.mat-datepicker-toggle');
    if (isDatePickerToggle) {
      this.datePickerToggleClicked = true;
      // Clear the flag after a short delay
      setTimeout(() => {
        this.datePickerToggleClicked = false;
      }, 300);
    }
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
                        target.closest('.cdk-overlay-pane') ||
                        target.closest('.mat-calendar-body') ||
                        target.closest('.mat-calendar-header');
    const isDatePickerToggle = target.closest('.mat-datepicker-toggle');
    const isDatePickerInput = target.closest('input[matDatepicker]');
    const isDatePickerContainer = target.closest('.ax-date-range-picker-container');
    const isDatePickerButton = target.closest('button[mat-icon-button]') && target.closest('.mat-datepicker-toggle');
    
    // Don't close if clicking on datepicker elements, inside popup, or if toggle was just clicked
    if (isDatePickerToggle || 
        isDatePickerInput || 
        isDateRangePopup || 
        isDateRangePicker || 
        isDatePicker || 
        isDatePickerContainer ||
        isDatePickerButton ||
        this.datePickerToggleClicked) {
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
