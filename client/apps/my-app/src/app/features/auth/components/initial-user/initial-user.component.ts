import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../core/http.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CreateUserRequest, LoginRequest } from '../../../users/models/user';

@Component({
  selector: 'app-initial-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './initial-user.component.html',
  styleUrls: ['./initial-user.component.scss']
})
export class InitialUserComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  roles = ['Admin', 'Basic'];

  private fb = inject(FormBuilder);
  private httpService = inject(HttpService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Check if users already exist, if so redirect to login
    this.authService.checkUsers().subscribe(hasUsers => {
      if (hasUsers) {
        this.router.navigate(['/login']);
      }
    });
    this.userForm = this.fb.group({
      userid: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['Admin', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData: CreateUserRequest = {
        userid: this.userForm.value.userid,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        email: '', // Email not required for initial user
        password: this.userForm.value.password,
        role: this.userForm.value.role,
        jsonData: {}
      };

      this.httpService.post('users', userData).subscribe({
        next: (createdUser) => {
          // Automatically log in the user after creation
          // Use form values directly since password is required and validated
          const loginCredentials: LoginRequest = {
            userid: this.userForm.value.userid,
            password: this.userForm.value.password
          };
          
          this.authService.login(loginCredentials).subscribe({
            next: () => {
              this.isLoading = false;
              // Update auth service to reflect that users now exist
              this.authService.checkUsers().subscribe(() => {
                // Navigate directly to main app, skipping login
                this.router.navigate(['/']);
              });
            },
            error: (loginError) => {
              this.isLoading = false;
              // If login fails, still update hasUsers and redirect to login
              this.authService.checkUsers().subscribe(() => {
                this.router.navigate(['/login']);
              });
            }
          });
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'initialUser.error';
          }
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'validation.required';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength || 6;
      return `validation.minlength`.replace('{{min}}', String(minLength));
    }
    if (field?.hasError('passwordMismatch')) {
      return 'initialUser.passwordMismatch';
    }
    return '';
  }
}
