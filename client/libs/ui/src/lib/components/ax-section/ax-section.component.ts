import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable section component
 * Provides consistent section styling
 */
@Component({
  selector: 'ax-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-section.component.html',
  styleUrls: ['./ax-section.component.scss']
})
export class AxSectionComponent {
}

