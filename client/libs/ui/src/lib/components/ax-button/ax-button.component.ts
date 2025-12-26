import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Reusable button component
 * Provides consistent button styling and behavior across the application
 */
@Component({
  selector: 'ax-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './ax-button.component.html',
  styleUrls: ['./ax-button.component.scss'],
})
export class AxButtonComponent
{
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() variant: 'raised' | 'flat' | 'stroked' | 'icon' = 'raised';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() label?: string;
  @Output() click = new EventEmitter<MouseEvent>();

  onButtonClick(event: MouseEvent): void
  {
    if (!this.disabled && !this.loading)
    {
      console.log('AxButtonComponent: Button clicked', { variant: this.variant, type: this.type });
      this.click.emit(event);
    } else
 {
      console.log('AxButtonComponent: Button click ignored (disabled or loading)', { disabled: this.disabled, loading: this.loading });
    }
  }
}

