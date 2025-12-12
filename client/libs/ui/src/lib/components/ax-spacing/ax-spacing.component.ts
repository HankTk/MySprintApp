import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable spacing component
 * Provides consistent spacing between elements
 */
@Component({
  selector: 'ax-spacing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-spacing.component.html',
  styleUrls: ['./ax-spacing.component.scss']
})
export class AxSpacingComponent {
  @Input() size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  @Input() vertical = false;
  @Input() horizontal = false;
}

