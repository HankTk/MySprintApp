import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable container component
 * Provides consistent page container styling
 */
@Component({
  selector: 'ax-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-container.component.html',
  styleUrls: ['./ax-container.component.scss']
})
export class AxContainerComponent {
}

