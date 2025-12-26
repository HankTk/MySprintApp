import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable form group component
 * Provides consistent form field grouping
 */
@Component({
  selector: 'ax-form-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ax-form-group.component.html',
  styleUrls: ['./ax-form-group.component.scss']
})
export class AxFormGroupComponent
{
}

