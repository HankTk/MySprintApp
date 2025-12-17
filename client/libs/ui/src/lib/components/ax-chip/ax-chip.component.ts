import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable chip component
 * Provides consistent chip/tag styling
 */
@Component({
  selector: 'ax-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './ax-chip.component.html',
  styleUrls: ['./ax-chip.component.scss']
})
export class AxChipComponent {
  @Input() label?: string;
  @Input() color?: 'primary' | 'accent' | 'warn';
  @Input() removable = false;
  @Input() disabled = false;
  @Input() selected = false;
  @Input() highlighted = false;
  @Input() leadingIcon?: string;
  @Input() trailingIcon?: string;
  @Input() customColor?: string;
  @Input() customBackgroundColor?: string;
  @Output() removed = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<boolean>();

  onRemove(): void {
    if (!this.disabled && this.removable) {
      this.removed.emit();
    }
  }

  onSelectionChange(): void {
    if (!this.disabled) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
    }
  }
}
