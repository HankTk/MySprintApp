import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxDateRangePickerComponent, AxCardComponent, MatCardModule } from '@ui/components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-date-range-picker-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    AxDateRangePickerComponent, 
    AxCardComponent, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './date-range-picker-page.component.html',
  styleUrls: ['./date-range-picker-page.component.scss']
})
export class DateRangePickerPageComponent {
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Single field date range picker (table filter style)
  isDateRangePickerOpen = false;
  singleFieldStartDate: Date | null = null;
  singleFieldEndDate: Date | null = null;

  toggleDateRangePicker(): void {
    this.isDateRangePickerOpen = !this.isDateRangePickerOpen;
  }

  closeSingleFieldDateRangePicker(): void {
    this.isDateRangePickerOpen = false;
  }

  clearSingleFieldDateRange(): void {
    this.singleFieldStartDate = null;
    this.singleFieldEndDate = null;
    this.isDateRangePickerOpen = false;
  }

  onSingleFieldStartDateChange(date: Date | null): void {
    this.singleFieldStartDate = date;
  }

  onSingleFieldEndDateChange(date: Date | null): void {
    this.singleFieldEndDate = date;
  }

  getDateRangeDisplay(): string {
    if (!this.singleFieldStartDate && !this.singleFieldEndDate) {
      return '';
    }
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      return date.toLocaleDateString();
    };
    const start = formatDate(this.singleFieldStartDate);
    const end = formatDate(this.singleFieldEndDate);
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `From ${start}`;
    } else if (end) {
      return `Until ${end}`;
    }
    return '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
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
    
    if (isDatePickerToggle || 
        isDatePickerInput || 
        isDateRangePopup || 
        isDateRangePicker || 
        isDatePicker || 
        isDatePickerContainer) {
      return;
    }
    
    if (!isDateRangeInput && this.isDateRangePickerOpen) {
      this.isDateRangePickerOpen = false;
    }
  }
}

