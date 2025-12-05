import { Component, Inject, inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface DeleteConfirmDialogData
{
  userName: string;
  userEmail: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
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

  onConfirm(): void
  {
    this.dialogRef.close(true);
  }

  onCancel(): void
  {
    this.dialogRef.close(false);
  }
}
