import {HttpInterceptorFn, HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from './auth/auth.service';
import {
  ServerUnavailableDialogComponent
} from '../shared/components/server-unavailable-dialog/server-unavailable-dialog.component';

// Track if server unavailable dialog is already open to prevent multiple dialogs
let serverUnavailableDialogOpen = false;
// Store dialog reference so it can be closed from outside (e.g., shutdown button)
let currentServerUnavailableDialogRef: any = null;

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally and displays user-friendly error messages
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
{

  const snackBar = inject(MatSnackBar);
  const dialog = inject(MatDialog);
  const translate = inject(TranslateService);
  const authService = inject(AuthService);

  return next(req).pipe(
      catchError((error: HttpErrorResponse) =>
      {
        let messageKey = '';
        let showDialog = false;

        // Handle different error types
        if (error.status === 0)
        {
          // Network error or server unavailable
          // Status 0 typically means server is not reachable (not running, CORS issue, etc.)
          // Show modal dialog instead of toast for server unavailable
          messageKey = 'messages.serverUnavailable';
          showDialog = true;
        }
        else if (error.status >= 500)
        {
          // Server error
          messageKey = 'messages.serverError';
        }
        else if (error.status === 401)
        {
          // Unauthorized - token expired or invalid
          // Don't logout for login endpoint
          if (!req.url.includes('/auth/login'))
          {
            authService.logout();
          }
          messageKey = 'messages.unauthorized';
        }
        else if (error.status === 403)
        {
          // Forbidden
          messageKey = 'messages.forbidden';
        }
        else if (error.status === 404)
        {
          // Not found
          messageKey = 'messages.notFound';
        }

        // Show modal dialog for server unavailable
        if (showDialog && !serverUnavailableDialogOpen)
        {
          serverUnavailableDialogOpen = true;
          const dialogRef = dialog.open(ServerUnavailableDialogComponent,
              {
                width: '100vw',
                maxWidth: '100vw',
                height: '100vh',
                maxHeight: '100vh',
                disableClose: true, // Prevent closing by clicking outside
                panelClass: 'server-unavailable-fullscreen-dialog',
                hasBackdrop: true,
                backdropClass: 'server-unavailable-backdrop',
                data: {
                  message: translate.instant(messageKey)
                }
              });

          // Store dialog reference globally so it can be closed from shutdown button
          currentServerUnavailableDialogRef = dialogRef;

          dialogRef.afterClosed().subscribe(() =>
          {
            serverUnavailableDialogOpen = false;
            currentServerUnavailableDialogRef = null;
          });
        }
        // Show snackbar for other errors
        else if (messageKey && !showDialog)
        {
          const message = translate.instant(messageKey);
          const closeLabel = translate.instant('messages.close');
          snackBar.open(message, closeLabel, {
            duration: 5000
          });
        }

        return throwError(() => error);
      })
  );

};

/**
 * Close server unavailable dialog from outside (e.g., shutdown button)
 * This function can be called from components to close the dialog
 */
export function closeServerUnavailableDialog(): void
{
  console.log('closeServerUnavailableDialog called', {
    hasRef: !!currentServerUnavailableDialogRef,
    isOpen: serverUnavailableDialogOpen
  });
  if (currentServerUnavailableDialogRef)
  {
    console.log('Closing dialog...');
    currentServerUnavailableDialogRef.close();
    currentServerUnavailableDialogRef = null;
    serverUnavailableDialogOpen = false;
    console.log('Dialog closed');
  }
  else
  {
    console.warn('No dialog reference to close');
  }
}

/**
 * Show server unavailable dialog
 * This function can be called from components to show the dialog
 */
export function showServerUnavailableDialog(dialog: MatDialog, translate: TranslateService): void
{
  if (!serverUnavailableDialogOpen)
  {
    serverUnavailableDialogOpen = true;
    const dialogRef = dialog.open(ServerUnavailableDialogComponent,
        {
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          disableClose: true,
          panelClass: 'server-unavailable-fullscreen-dialog',
          hasBackdrop: true,
          backdropClass: 'server-unavailable-backdrop',
          data: {
            message: translate.instant('messages.serverUnavailable')
          }
        });

    currentServerUnavailableDialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(() =>
    {
      serverUnavailableDialogOpen = false;
      currentServerUnavailableDialogRef = null;
    });
  }
}

/**
 * Check if server unavailable dialog is currently open
 * This function can be called from components to check if the dialog is open
 */
export function isServerUnavailableDialogOpen(): boolean
{
  return serverUnavailableDialogOpen;
}
