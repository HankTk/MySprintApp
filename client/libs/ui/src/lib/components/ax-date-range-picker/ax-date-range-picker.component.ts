import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

/**
 * Reusable date range picker component
 * Provides consistent date range selection styling and form integration
 */
@Component({
  selector: 'ax-date-range-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './ax-date-range-picker.component.html',
  styleUrls: ['./ax-date-range-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxDateRangePickerComponent),
      multi: true
    }
  ]
})
export class AxDateRangePickerComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() error = false;
  @Input() hint?: string;
  @Input() startDate?: Date | null;
  @Input() endDate?: Date | null;
  @Output() startDateChange = new EventEmitter<Date | null>();
  @Output() endDateChange = new EventEmitter<Date | null>();

  private onChange = (value: { start: Date | null; end: Date | null }) => {};
  onTouched = () => {};

  writeValue(value: { start: Date | null; end: Date | null }): void {
    if (value) {
      this.startDate = value.start;
      this.endDate = value.end;
    }
  }

  registerOnChange(fn: (value: { start: Date | null; end: Date | null }) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onStartDateChange(date: Date | null): void {
    this.startDate = date;
    this.startDateChange.emit(date);
    this.onChange({ start: date, end: this.endDate || null });
    this.onTouched();
  }

  onEndDateChange(date: Date | null): void {
    this.endDate = date;
    this.endDateChange.emit(date);
    this.onChange({ start: this.startDate || null, end: date });
    this.onTouched();
  }
}

