import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from '../../../../core/http.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CreateUserRequest, LoginRequest } from '../../../users/models/user';
import { closeServerUnavailableDialog, isServerUnavailableDialogOpen } from '../../../../core/http-interceptor';
import { 
  AxButtonComponent, 
  AxIconComponent
} from '@ui/components';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-initial-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './initial-user.component.html',
  styleUrls: ['./initial-user.component.scss']
})
export class InitialUserComponent implements OnInit, OnDestroy
{
  userForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  isServerUnavailable = false;
  private checkUsersInterval: any = null;

  private fb = inject(FormBuilder);
  private httpService = inject(HttpService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  ngOnInit(): void
  {
    this.checkUsersAndRedirect();
    this.userForm = this.fb.group({
      userid: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    // Periodically check if users exist (in case server becomes available)
    // This helps when server unavailable dialog is closed after retry
    this.checkUsersInterval = setInterval(() =>
    {
      if (!isServerUnavailableDialogOpen())
      {
        this.checkUsersAndRedirect();
      }
    }, 2000); // Check every 2 seconds
  }

  ngOnDestroy(): void
  {
    if (this.checkUsersInterval)
    {
      clearInterval(this.checkUsersInterval);
      this.checkUsersInterval = null;
    }
  }

  private checkUsersAndRedirect(): void
 {
    this.authService.checkUsers().subscribe({
      next: (hasUsers) =>
      {
        if (hasUsers)
        {
          console.log('Users already exist, redirecting to login page');
          this.router.navigate(['/login']);
        }
      },
      error: (error) =>
      {
        // Server unavailable - error will be handled by HTTP interceptor
        console.log('Error checking users (server may be unavailable):', error);
      }
    });
  }

  passwordMatchValidator(form: FormGroup)
  {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value)
    {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void
  {
    // Prevent form submission if server unavailable dialog is open
    if (isServerUnavailableDialogOpen())
    {
      console.log('Form submission prevented: Server unavailable dialog is open');
      return;
    }

    if (this.userForm.valid)
    {
      this.isLoading = true;
      this.errorMessage = '';

      const userData: CreateUserRequest =
      {
        userid: this.userForm.value.userid,
        firstName: '',
        lastName: '',
        email: '',
        password: this.userForm.value.password,
        role: 'Admin',
        jsonData: {}
      };

      this.httpService.post('users', userData).subscribe({
        next: (createdUser) =>
        {
          const loginCredentials: LoginRequest =
          {
            userid: this.userForm.value.userid,
            password: this.userForm.value.password
          };
          
          this.authService.login(loginCredentials).subscribe({
            next: () =>
            {
              this.isLoading = false;
              this.authService.checkUsers().subscribe(() =>
              {
                this.router.navigate(['/']);
              });
            },
            error: (loginError) =>
            {
              this.isLoading = false;
              this.authService.checkUsers().subscribe(() =>
              {
                this.router.navigate(['/login']);
              });
            }
          });
        },
        error: (error) =>
        {
          this.isLoading = false;
          // Check if error is due to server being unavailable
          if (error.status === 0)
          {
            this.isServerUnavailable = true;
            // Error will be handled by HTTP interceptor (shows dialog)
            // Don't set errorMessage here as dialog will be shown
            return;
          }
          if (error.error?.error)
          {
            this.errorMessage = error.error.error;
          }
 else
 {
            this.errorMessage = 'initialUser.error';
          }
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string
  {
    const field = this.userForm.get(fieldName);
    if (field?.errors)
    {
      if (field.errors['required'])
      {
        return this.translate.instant('validation.required');
      }
      if (field.errors['minlength'])
      {
        return this.translate.instant('validation.minlength', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['passwordMismatch'])
      {
        return this.translate.instant('initialUser.passwordMismatch');
      }
    }
    return '';
  }

  // Expose the function to template
  isServerUnavailableDialogOpen = isServerUnavailableDialogOpen;

  shutdown(): void
  {
    console.log('=== Shutdown button clicked - InitialUserComponent ===');
    console.log('Step 1: Closing all dialogs...');
    
    // Close all open dialogs (including server unavailable dialog)
    try
    {
      this.dialog.closeAll();
      console.log('All dialogs closed');
    }
    catch (error)
    {
      console.error('Error closing dialogs:', error);
    }
    
    // Also try the specific function
    closeServerUnavailableDialog();
    
    console.log('Step 2: Proceeding with shutdown...');
    
    console.log('window.electronAPI:', window.electronAPI);
    
    if (window.electronAPI && typeof window.electronAPI.shutdown === 'function')
    {
      console.log('Calling window.electronAPI.shutdown()');
      try
      {
        window.electronAPI.shutdown();
        console.log('Shutdown called successfully');
      }
      catch (error)
      {
        console.error('Error shutting down application:', error);
        alert('Error shutting down: ' + error);
      }
    }
 else
 {
      console.warn('Electron API not available.');
      console.log('Attempting window.close()');
      if (typeof window.close === 'function')
      {
        try 
{
          window.close();
          console.log('window.close() called');
          // Note: window.close() may not work in all browsers due to security restrictions
          // If it doesn't work, show a message to the user
          setTimeout(() =>
          {
            alert('このアプリケーションを閉じるには、ブラウザのタブを閉じてください。');
          }, 100);
        }
 catch (error)
 {
          console.error('Error closing window:', error);
          alert('このアプリケーションを閉じるには、ブラウザのタブを閉じてください。');
        }
      }
 else
 {
        console.error('window.close is not available');
        alert('このアプリケーションを閉じるには、ブラウザのタブを閉じてください。');
      }
    }
  }
}
