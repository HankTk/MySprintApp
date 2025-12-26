import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

/**
 * Reusable card component
 * Provides consistent card styling across the application
 * 
 * Usage:
 * 1. Simple mode: Pass title and subtitle as inputs
 * 2. Custom header: Use <ng-container ax-card-header> for custom header content
 * 3. Actions: Use <ng-container ax-card-actions> for action buttons
 */
@Component({
  selector: 'ax-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './ax-card.component.html',
  styleUrls: ['./ax-card.component.scss']
})
export class AxCardComponent
{
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() elevation: number = 1;
  @Input() appearance: 'raised' | 'outlined' = 'raised';
}

// Re-export Material Card module for pass-through usage
export { MatCardModule } from '@angular/material/card';
