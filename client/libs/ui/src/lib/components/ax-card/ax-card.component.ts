import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

/**
 * Reusable card component
 * Provides consistent card styling across the application
 */
@Component({
  selector: 'ax-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './ax-card.component.html',
  styleUrls: ['./ax-card.component.scss']
})
export class AxCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() elevation: number = 1;
}

