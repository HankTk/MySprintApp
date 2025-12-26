import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable heading component
 * Provides consistent heading styling for h1 through h6
 * 
 * Usage:
 * <ax-heading [level]="1">Heading 1</ax-heading>
 * <ax-heading [level]="2">Heading 2</ax-heading>
 * <ax-heading [level]="3">Heading 3</ax-heading>
 * <ax-heading [level]="4">Heading 4</ax-heading>
 * <ax-heading [level]="5">Heading 5</ax-heading>
 * <ax-heading [level]="6">Heading 6</ax-heading>
 */
@Component({
  selector: 'ax-heading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-heading.component.html',
  styleUrls: ['./ax-heading.component.scss']
})
export class AxHeadingComponent
{
  @Input() level: 1 | 2 | 3 | 4 | 5 | 6 = 3;
}
