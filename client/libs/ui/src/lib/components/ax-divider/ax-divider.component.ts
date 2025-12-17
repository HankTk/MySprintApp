import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Reusable divider component
 * Provides consistent visual separation
 */
@Component({
  selector: 'ax-divider',
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  templateUrl: './ax-divider.component.html',
  styleUrls: ['./ax-divider.component.scss']
})
export class AxDividerComponent {
  @Input() vertical = false;
  @Input() inset = false;
}
