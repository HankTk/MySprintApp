import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable icon component
 * Provides consistent icon styling across the application
 */
@Component({
  selector: 'ax-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './ax-icon.component.html',
  styleUrls: ['./ax-icon.component.scss'],
})
export class AxIconComponent {
  @Input() name!: string;
  @Input() color?: 'primary' | 'accent' | 'warn';
  @Input() size?: 'small' | 'medium' | 'large' = 'medium';
  @Input() fontSet?: string;
  @Input() inline = false;
}
