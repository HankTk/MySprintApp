import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

export interface AxListItem
{
  label: string;
  icon?: string;
  secondaryText?: string;
  disabled?: boolean;
  value?: any;
  href?: string;
  routerLink?: string | any[];
}

/**
 * Reusable list component
 * Provides consistent list styling
 */
@Component({
  selector: 'ax-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './ax-list.component.html',
  styleUrls: ['./ax-list.component.scss']
})
export class AxListComponent
{
  @Input() items: AxListItem[] = [];
  @Input() dense = false;
  @Input() disableRipple = false;
  @Output() itemClick = new EventEmitter<AxListItem>();

  onItemClick(item: AxListItem): void
  {
    if (!item.disabled)
    {
      this.itemClick.emit(item);
    }
  }
}
