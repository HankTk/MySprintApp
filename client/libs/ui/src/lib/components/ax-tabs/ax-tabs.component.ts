import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';

/**
 * Tab panel configuration
 */
export interface AxTabPanel
{
  label: string;
  disabled?: boolean;
  icon?: string;
}

/**
 * Reusable tabs component
 * Provides consistent tab navigation styling
 */
@Component({
  selector: 'ax-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule],
  templateUrl: './ax-tabs.component.html',
  styleUrls: ['./ax-tabs.component.scss']
})
export class AxTabsComponent
{
  @Input() tabs: AxTabPanel[] = [];
  @Input() selectedIndex = 0;
  @Input() animationDuration = '500ms';
  @Input() backgroundColor?: 'primary' | 'accent' | 'warn';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() fitInkBarToContent = false;
  @Input() preserveContent = false;
  @Output() selectedTabChange = new EventEmitter<number>();
  @Output() selectedIndexChange = new EventEmitter<number>();

  onTabChange(event: MatTabChangeEvent): void
  {
    this.selectedTabChange.emit(event.index);
    this.selectedIndexChange.emit(event.index);
  }
}
