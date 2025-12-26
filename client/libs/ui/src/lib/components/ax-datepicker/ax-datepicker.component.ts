import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

/**
 * Reusable datepicker component
 * Provides consistent date selection styling and form integration
 */
@Component({
  selector: 'ax-datepicker',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './ax-datepicker.component.html',
  styleUrls: ['./ax-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxDatepickerComponent),
      multi: true
    }
  ]
})
export class AxDatepickerComponent implements ControlValueAccessor
{
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() min?: Date;
  @Input() max?: Date;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Output() dateChange = new EventEmitter<Date | null>();

  value: Date | null = null;
  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  writeValue(value: Date | null): void
  {
    this.value = value;
  }

  registerOnChange(fn: (value: Date | null) => void): void
  {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void
  {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void
  {
    this.disabled = isDisabled;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void
  {
    this.value = event.value;
    this.onChange(this.value);
    this.dateChange.emit(this.value);
  }

  onBlur(): void
  {
    this.onTouched();
  }
}
