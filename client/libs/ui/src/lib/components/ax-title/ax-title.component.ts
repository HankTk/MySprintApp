import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable title component
 * Provides consistent title styling
 */
@Component({
  selector: 'ax-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-title.component.html',
  styleUrls: ['./ax-title.component.scss']
})
export class AxTitleComponent {
}

