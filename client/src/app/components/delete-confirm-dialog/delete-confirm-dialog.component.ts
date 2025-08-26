import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { I18nPipe } from '../../pipes/i18n.pipe';

export interface DeleteConfirmDialogData {
  userName: string;
  userEmail: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    I18nPipe
  ],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.scss']
})
export class DeleteConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<DeleteConfirmDialogComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DeleteConfirmDialogData) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
