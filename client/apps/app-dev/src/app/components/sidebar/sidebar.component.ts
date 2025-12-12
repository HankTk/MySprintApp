import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() currentPage: string = 'button';
  @Output() pageChange = new EventEmitter<string>();

  menuItems: MenuItem[] = [
    { id: 'button', label: 'Button', icon: 'radio_button_checked' },
    { id: 'card', label: 'Card', icon: 'view_module' },
    { id: 'input', label: 'Input', icon: 'input' },
    { id: 'table', label: 'Table', icon: 'table_chart' },
    { id: 'dialog', label: 'Dialog', icon: 'open_in_new' },
    { id: 'checkbox', label: 'Checkbox', icon: 'check_box' },
    { id: 'radio', label: 'Radio', icon: 'radio_button_checked' },
    { id: 'progress', label: 'Progress', icon: 'linear_scale' },
    { id: 'listbox', label: 'Listbox', icon: 'list' },
    { id: 'date-range-picker', label: 'Date Range Picker', icon: 'date_range' }
  ];

  onItemClick(itemId: string): void {
    this.pageChange.emit(itemId);
  }
}

