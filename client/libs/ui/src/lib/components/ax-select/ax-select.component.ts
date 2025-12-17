import { Component, Input, Output, EventEmitter, forwardRef, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface AxSelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Reusable select component
 * Provides consistent select/dropdown styling and form integration
 */
@Component({
  selector: 'ax-select',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './ax-select.component.html',
  styleUrls: ['./ax-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxSelectComponent),
      multi: true
    }
  ]
})
export class AxSelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() options: AxSelectOption[] = [];
  @Input() required = false;
  @Input() disabled = false;
  @Input() multiple = false;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Output() selectionChange = new EventEmitter<any>();

  value: any;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: MatSelectChange): void {
    this.value = event.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
