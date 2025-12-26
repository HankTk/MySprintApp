import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable section title component
 * Provides consistent section title styling
 */
@Component({
  selector: 'ax-section-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-section-title.component.html',
  styleUrls: ['./ax-section-title.component.scss']
})
export class AxSectionTitleComponent
{
}

