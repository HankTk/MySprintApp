import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AxButtonComponent, AxIconComponent } from '@ui/components';
import { showServerUnavailableDialog } from '../../../core/http-interceptor';

export interface ServerUnavailableDialogData {
  message?: string;
}

/**
 * Server Unavailable Dialog Component
 * Displays a modal dialog when the server is not available
 * Prevents user from continuing operations until server is available
 */
@Component({
  selector: 'app-server-unavailable-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './server-unavailable-dialog.component.html',
  styleUrls: ['./server-unavailable-dialog.component.scss']
})
export class ServerUnavailableDialogComponent {
  isRetrying = false;

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    public dialogRef: MatDialogRef<ServerUnavailableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServerUnavailableDialogData,
    private translate: TranslateService
  ) {}

  get message(): string {
    return this.data?.message || this.translate.instant('messages.serverUnavailable');
  }

  onRetry(): void {
    this.isRetrying = true;
    console.log('Retry button clicked - checking server availability...');
    
    // Try to make a simple request to check if server is available
    // Use a lightweight endpoint like checking users
    this.http.get(`${this.apiUrl}/users`, { observe: 'response' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Server still unavailable:', error);
        this.isRetrying = false;
        
        // Server is still unavailable (status === 0 or other error)
        if (error.status === 0) {
          // Close current dialog
          this.dialogRef.close(false);
          
          // Show dialog again after a short delay to ensure the previous one is closed
          setTimeout(() => {
            showServerUnavailableDialog(this.dialog, this.translate);
          }, 100);
        } else {
          // Other error, just close the dialog
          this.dialogRef.close(false);
        }
        
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log('Server is now available!');
          this.isRetrying = false;
          // Server is available, close the dialog
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        // Already handled in catchError
        this.isRetrying = false;
      }
    });
  }
}
