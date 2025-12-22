import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { AxIconComponent } from '@ui/components';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, AxIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() currentPage: string = 'button';
  @Output() pageChange = new EventEmitter<string>();

  menuItems: MenuItem[] = [
    { id: 'button', label: 'Button', icon: 'radio_button_checked' },
    { id: 'card', label: 'Card', icon: 'view_module' },
    { id: 'chart', label: 'Chart', icon: 'bar_chart' },
    { id: 'checkbox', label: 'Checkbox', icon: 'check_box' },
    { id: 'chip', label: 'Chip', icon: 'label' },
    { id: 'date-range-picker', label: 'Date Range Picker', icon: 'date_range' },
    { id: 'datepicker', label: 'Datepicker', icon: 'event' },
    { id: 'dialog', label: 'Dialog', icon: 'open_in_new' },
    { id: 'icon', label: 'Icon', icon: 'insert_emoticon' },
    { id: 'input', label: 'Input', icon: 'input' },
    { id: 'listbox', label: 'Listbox', icon: 'list' },
    { id: 'progress', label: 'Progress', icon: 'linear_scale' },
    { id: 'radio', label: 'Radio', icon: 'radio_button_checked' },
    { id: 'select', label: 'Select', icon: 'arrow_drop_down_circle' },
    { id: 'table', label: 'Table', icon: 'table_chart' },
    { id: 'tabs', label: 'Tabs', icon: 'tab' },
    { id: 'textarea', label: 'Textarea', icon: 'notes' },
    { id: 'tooltip', label: 'Tooltip', icon: 'info' },
    { id: 'typography', label: 'Typography', icon: 'text_fields' }
  ];

  onItemClick(itemId: string): void {
    this.pageChange.emit(itemId);
  }
}

