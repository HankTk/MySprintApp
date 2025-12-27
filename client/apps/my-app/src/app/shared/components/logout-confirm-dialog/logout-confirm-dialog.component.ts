import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {TranslateModule} from '@ngx-translate/core';
import {AxIconComponent} from '@ui/components';

@Component({
  selector: 'app-logout-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    AxIconComponent
  ],
  templateUrl: './logout-confirm-dialog.component.html',
  styleUrls: ['./logout-confirm-dialog.component.scss']
})
export class LogoutConfirmDialogComponent
{
  private dialogRef = inject(MatDialogRef<LogoutConfirmDialogComponent>);

  onConfirm(): void
  {
    // Close dialog immediately
    this.dialogRef.close(true);
  }

  onCancel(): void
  {
    // Close dialog immediately
    this.dialogRef.close(false);
  }
}
