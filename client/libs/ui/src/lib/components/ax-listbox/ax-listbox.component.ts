import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface ListboxOption
{
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Reusable listbox/select component
 * Provides consistent dropdown styling and form integration
 */
@Component({
  selector: 'ax-listbox',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './ax-listbox.component.html',
  styleUrls: ['./ax-listbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxListboxComponent),
      multi: true
    }
  ]
})
export class AxListboxComponent implements ControlValueAccessor
{
  @Input() options: ListboxOption[] = [];
  @Input() placeholder?: string;
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() error = false;
  @Input() label?: string;
  @Input() hint?: string;

  value: string | string[] | null = null;
  private onChange = (value: string | string[]) => {};
  public onTouched = () => {};

  writeValue(value: string | string[]): void
  {
    this.value = value || (this.multiple ? [] : null);
  }

  registerOnChange(fn: (value: string | string[]) => void): void
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

  onSelectionChange(event: any): void
  {
    this.value = event.value;
    if (this.value !== null)
    {
      this.onChange(this.value);
    }
    this.onTouched();
  }
}

