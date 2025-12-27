import {Injectable, inject} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Notification service
 * Provides a centralized way to display notifications to users
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService
{
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  show(message: string, type: NotificationType = 'info', duration = 5000): void
  {
    const config: MatSnackBarConfig =
        {
          duration,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: [`${type}-snackbar`]
        };

    const closeLabel = this.translate.instant('messages.close');
    this.snackBar.open(message, closeLabel, config);
  }

  success(message: string, duration?: number): void
  {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void
  {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void
  {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void
  {
    this.show(message, 'warning', duration);
  }
}
