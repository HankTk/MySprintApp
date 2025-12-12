import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

/**
 * Reusable radio component
 * Provides consistent radio button styling and form integration
 */
@Component({
  selector: 'ax-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, MatRadioModule],
  templateUrl: './ax-radio.component.html',
  styleUrls: ['./ax-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxRadioComponent),
      multi: true
    }
  ]
})
export class AxRadioComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() name?: string;
  @Input() value?: string;
  @Input() error = false;
  @Input() disabled = false;
  @Input() id?: string;
  @Input() checked = false;
  private onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this.checked = this.value === value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRadioChange(): void {
    if (this.value) {
      this.onChange(this.value);
      this.onTouched();
    }
  }
}

