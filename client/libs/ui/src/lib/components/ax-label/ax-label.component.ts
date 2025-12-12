import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable label component
 * Provides consistent label styling
 */
@Component({
  selector: 'ax-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-label.component.html',
  styleUrls: ['./ax-label.component.scss']
})
export class AxLabelComponent {
  @Input() for?: string;
  @Input() required = false;
}

