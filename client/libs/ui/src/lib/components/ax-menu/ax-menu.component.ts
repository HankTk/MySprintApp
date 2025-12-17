import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule, MatMenu, MenuPositionX, MenuPositionY } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface AxMenuItem {
  label: string;
  icon?: string;
  disabled?: boolean;
  value?: any;
  divider?: boolean;
}

/**
 * Reusable menu component
 * Provides consistent dropdown menu styling
 */
@Component({
  selector: 'ax-menu',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './ax-menu.component.html',
  styleUrls: ['./ax-menu.component.scss']
})
export class AxMenuComponent {
  @ViewChild('menu') menu?: MatMenu;
  
  @Input() items: AxMenuItem[] = [];
  @Input() triggerIcon?: string;
  @Input() triggerLabel?: string;
  @Input() xPosition: MenuPositionX = 'after';
  @Input() yPosition: MenuPositionY = 'below';
  @Input() overlapTrigger = false;
  @Output() itemClick = new EventEmitter<AxMenuItem>();
  @Output() menuOpened = new EventEmitter<void>();
  @Output() menuClosed = new EventEmitter<void>();

  onItemClick(item: AxMenuItem): void {
    if (!item.disabled && !item.divider) {
      this.itemClick.emit(item);
    }
  }

  onMenuOpened(): void {
    this.menuOpened.emit();
  }

  onMenuClosed(): void {
    this.menuClosed.emit();
  }
}
