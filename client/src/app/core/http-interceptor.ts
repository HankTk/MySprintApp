import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * HTTP Error Interceptor
 * Handles HTTP errors globally and displays user-friendly error messages
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const snackBar = inject(MatSnackBar);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let messageKey = '';
      // Handle different error types
      if (error.status === 0) {
        // Network error
        messageKey = 'messages.networkError';
      } 
      else if (error.status >= 500) {
        // Server error
        messageKey = 'messages.serverError';
      } 
      else if (error.status === 401) {
        // Unauthorized
        messageKey = 'messages.unauthorized';
      } 
      else if (error.status === 403) {
        // Forbidden
        messageKey = 'messages.forbidden';
      } 
      else if (error.status === 404) {
        // Not found
        messageKey = 'messages.notFound';
      }

      if (messageKey) {
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
