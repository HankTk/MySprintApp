import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AxButtonComponent, AxIconComponent } from '@ui/components';

export interface DeleteConfirmDialogData
{
  // Generic properties
  title?: string;
  message?: string;
  itemName?: string;
  itemDetails?: string;
  // Legacy properties (for backward compatibility)
  userName?: string;
  userEmail?: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.scss']
})
export class DeleteConfirmDialogComponent
{
  private dialogRef = inject(MatDialogRef<DeleteConfirmDialogComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DeleteConfirmDialogData)
  {
  }

  get displayName(): string
 {
    return this.data.itemName || this.data.userName || '';
  }

  get displayDetails(): string
 {
    return this.data.itemDetails || this.data.userEmail || '';
  }

  onConfirm(): void
  {
    this.dialogRef.close(true);
  }

  onCancel(): void
  {
    this.dialogRef.close(false);
  }
}
