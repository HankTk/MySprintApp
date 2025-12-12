import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable grid component
 * Provides consistent grid layout
 */
@Component({
  selector: 'ax-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-grid.component.html',
  styleUrls: ['./ax-grid.component.scss']
})
export class AxGridComponent {
  @Input() columns?: number;
  @Input() gap?: string = '16px';
}

