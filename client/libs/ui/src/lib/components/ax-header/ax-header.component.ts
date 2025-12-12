import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable header component
 * Provides consistent header styling
 */
@Component({
  selector: 'ax-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-header.component.html',
  styleUrls: ['./ax-header.component.scss']
})
export class AxHeaderComponent {
}

