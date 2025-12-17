import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';

/**
 * Reusable form field wrapper component
 * Provides consistent form field styling with label, hint, and error support
 */
@Component({
  selector: 'ax-form-field',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule],
  templateUrl: './ax-form-field.component.html',
  styleUrls: ['./ax-form-field.component.scss']
})
export class AxFormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() floatLabel: 'always' | 'auto' = 'auto';
  @Input() hideRequiredMarker = false;
  @Input() subscriptSizing: 'fixed' | 'dynamic' = 'fixed';
}
