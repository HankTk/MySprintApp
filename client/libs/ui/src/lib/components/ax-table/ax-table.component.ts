import { Component, Input, TemplateRef, ContentChild, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';

/**
 * Reusable table component
 * Provides consistent table styling and functionality
 * 
 * Supports two modes:
 * 1. Simple mode: Pass dataSource and displayedColumns, use rowTemplate for custom cells
 * 2. Pass-through mode: Set passThrough=true and use ng-content for full mat-table control
 */
@Component({
  selector: 'ax-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './ax-table.component.html',
  styleUrls: ['./ax-table.component.scss'],
  exportAs: 'axTable'
})
export class AxTableComponent<T = any> implements OnInit, OnChanges {
  @Input() dataSource: T[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() showPaginator = true;
  @Input() showSort = true;
  @Input() passThrough = false;

  @ContentChild('rowTemplate') rowTemplate?: TemplateRef<any>;
  @ContentChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  currentPage = 0;
  currentPageSize = 10;
  sortedData: T[] = [];
  activeSort?: Sort;

  ngOnInit(): void {
    this.currentPageSize = this.pageSize;
    this.updateSortedData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] || changes['pageSize']) {
      if (changes['pageSize']) {
        this.currentPageSize = this.pageSize;
      }
      this.updateSortedData();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentPageSize = event.pageSize;
  }

  onSortChange(sort: Sort): void {
    this.activeSort = sort;
    this.updateSortedData();
  }

  private updateSortedData(): void {
    this.sortedData = [...this.dataSource];
    
    if (this.activeSort && this.activeSort.direction) {
      this.sortedData.sort((a, b) => {
        const aValue = (a as any)[this.activeSort!.active];
        const bValue = (b as any)[this.activeSort!.active];
        
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

  get paginatedData(): T[] {
    const start = this.currentPage * this.currentPageSize;
    const end = start + this.currentPageSize;
    return this.sortedData.slice(start, end);
  }
}

// Re-export Material Table module for pass-through usage
export { MatTableModule } from '@angular/material/table';
