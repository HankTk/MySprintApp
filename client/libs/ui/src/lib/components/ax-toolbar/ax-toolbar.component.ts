import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

/**
 * Reusable toolbar component
 * Provides consistent toolbar styling across the application
 */
@Component({
  selector: 'ax-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule],
  templateUrl: './ax-toolbar.component.html',
  styleUrls: ['./ax-toolbar.component.scss']
})
export class AxToolbarComponent
{
  @Input() color?: 'primary' | 'accent' | 'warn';
  @Input() multiple = false;
}
