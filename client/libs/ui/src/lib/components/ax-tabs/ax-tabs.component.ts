import { Component, Input, Output, EventEmitter, TemplateRef, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AxTabContentHostDirective } from './ax-tab-content-host.directive';

/**
 * Tab panel configuration
 */
export interface AxTabPanel
{
  label: string;
  disabled?: boolean;
  icon?: string;
  content?: string | TemplateRef<unknown>;
  contentClass?: string;
  component?: Type<unknown>; // Component class for dynamic component loading
  componentData?: Record<string, unknown>; // Data to pass to dynamic component
}

/**
 * Reusable tabs component
 * Provides consistent tab navigation styling
 */
@Component({
  selector: 'ax-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, AxTabContentHostDirective],
  templateUrl: './ax-tabs.component.html',
  styleUrls: ['./ax-tabs.component.scss']
})
export class AxTabsComponent
{
  private sanitizer = inject(DomSanitizer);

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

  isStringContent(content: string | TemplateRef<unknown> | undefined): content is string
  {
    return typeof content === 'string';
  }

  isTemplateRef(content: string | TemplateRef<unknown> | undefined): content is TemplateRef<unknown>
  {
    return content instanceof TemplateRef;
  }

  getSafeHtml(content: string): SafeHtml
  {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
