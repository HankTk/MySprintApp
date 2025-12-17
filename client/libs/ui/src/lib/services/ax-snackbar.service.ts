import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

export interface AxSnackbarConfig {
  duration?: number;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  panelClass?: string | string[];
}

/**
 * Snackbar service for showing notifications
 * Provides consistent notification behavior across the application
 */
@Injectable({
  providedIn: 'root'
})
export class AxSnackbarService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: AxSnackbarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  };

  show(message: string, action?: string, config?: AxSnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    const mergedConfig: MatSnackBarConfig = {
      duration: config?.duration ?? this.defaultConfig.duration,
      horizontalPosition: config?.horizontalPosition ?? this.defaultConfig.horizontalPosition,
      verticalPosition: config?.verticalPosition ?? this.defaultConfig.verticalPosition,
      panelClass: config?.panelClass
    };

    return this.snackBar.open(message, action, mergedConfig);
  }

  success(message: string, action = 'OK', config?: AxSnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, action, {
      ...config,
      panelClass: ['ax-snackbar-success', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  error(message: string, action = 'OK', config?: AxSnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, action, {
      ...config,
      duration: config?.duration ?? 5000,
      panelClass: ['ax-snackbar-error', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  warning(message: string, action = 'OK', config?: AxSnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, action, {
      ...config,
      panelClass: ['ax-snackbar-warning', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  info(message: string, action = 'OK', config?: AxSnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, action, {
      ...config,
      panelClass: ['ax-snackbar-info', ...(config?.panelClass ? (Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass]) : [])]
    });
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }
}
