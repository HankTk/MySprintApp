import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
 * Reusable checkbox component
 * Provides consistent checkbox styling and form integration
 */
@Component({
  selector: 'ax-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule],
  templateUrl: './ax-checkbox.component.html',
  styleUrls: ['./ax-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxCheckboxComponent),
      multi: true
    }
  ]
})
export class AxCheckboxComponent implements ControlValueAccessor
{
  @Input() label?: string;
  @Input() error = false;
  @Input() disabled = false;
  @Input() id?: string;
  @Input() checked = false;
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  writeValue(value: boolean): void
  {
    // Only update if checked is not explicitly set via @Input
    if (value !== undefined && value !== null)
    {
      this.checked = value;
    }
  }

  registerOnChange(fn: (value: boolean) => void): void
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

  onCheckboxChange(event: any): void
  {
    this.checked = event.checked;
    this.onChange(this.checked);
    this.onTouched();
  }
}

