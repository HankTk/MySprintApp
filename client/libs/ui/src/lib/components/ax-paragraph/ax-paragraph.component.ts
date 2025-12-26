import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable paragraph component
 * Provides consistent paragraph styling
 */
@Component({
  selector: 'ax-paragraph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-paragraph.component.html',
  styleUrls: ['./ax-paragraph.component.scss']
})
export class AxParagraphComponent
{
}

