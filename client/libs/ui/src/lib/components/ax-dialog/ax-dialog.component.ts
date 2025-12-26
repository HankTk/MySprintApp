import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable dialog component
 * Provides consistent dialog styling and behavior
 */
@Component({
  selector: 'ax-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './ax-dialog.component.html',
  styleUrls: ['./ax-dialog.component.scss']
})
export class AxDialogComponent
{

  @Input() title?: string;
  @Input() width?: string = '500px';
  @Input() showCloseButton = true;
  @Output() close = new EventEmitter<void>();

  @ContentChild('dialogContent') contentTemplate?: TemplateRef<any>;
  @ContentChild('dialogActions') actionsTemplate?: TemplateRef<any>;

  constructor(public dialogRef?: MatDialogRef<AxDialogComponent>)
  {
  }

  onClose(): void
  {
    if (this.dialogRef)
    {
      this.dialogRef.close();
    }
    this.close.emit();
  }

}

