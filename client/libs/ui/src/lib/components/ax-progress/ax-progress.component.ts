import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Reusable progress component
 * Provides consistent progress bar styling and functionality
 */
@Component({
  selector: 'ax-progress',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: './ax-progress.component.html',
  styleUrls: ['./ax-progress.component.scss']
})
export class AxProgressComponent
{
  @Input() value: number = 0;
  @Input() variant: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() mode: 'determinate' | 'indeterminate' = 'determinate';
  @Input() type: 'bar' | 'spinner' = 'bar';
  @Input() showLabel = false;
  @Input() label?: string;

  get clampedValue(): number
  {
    return Math.min(Math.max(this.value, 0), 100);
  }

  get displayLabel(): string
  {
    return this.label || `${Math.round(this.clampedValue)}%`;
  }
}

