import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { SelectionModel } from '@angular/cdk/collections';

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
    MatButtonModule
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
  columnFilters: { [key: string]: string } = {};
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
        const filterValue = this.columnFilters[col.key].toLowerCase();
        const cellValue = this.getCellValue(row, col);
        return String(cellValue).toLowerCase().includes(filterValue);
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

  onFilterChange(columnKey: string, value: string): void {
    this.columnFilters[columnKey] = value;
    this.currentPage = 0; // Reset to first page when filtering
    this.applyFilters();
    this.applySorting();
  }

  clearFilters(): void {
    this.columnFilters = {};
    this.currentPage = 0;
    this.applyFilters();
    this.applySorting();
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
