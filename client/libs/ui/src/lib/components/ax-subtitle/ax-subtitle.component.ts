import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable subtitle component
 * Provides consistent subtitle styling
 */
@Component({
  selector: 'ax-subtitle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-subtitle.component.html',
  styleUrls: ['./ax-subtitle.component.scss']
})
export class AxSubtitleComponent
{
}

