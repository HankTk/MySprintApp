import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpService } from '../../../../core/http.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CreateUserRequest, LoginRequest } from '../../../users/models/user';
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
export class InitialUserComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private httpService = inject(HttpService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  ngOnInit(): void {
    this.authService.checkUsers().subscribe(hasUsers => {
      if (hasUsers) {
        this.router.navigate(['/login']);
      }
    });
    this.userForm = this.fb.group({
      userid: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
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
        firstName: '',
        lastName: '',
        email: '',
        password: this.userForm.value.password,
        role: 'Admin',
        jsonData: {}
      };

      this.httpService.post('users', userData).subscribe({
        next: (createdUser) => {
          const loginCredentials: LoginRequest = {
            userid: this.userForm.value.userid,
            password: this.userForm.value.password
          };
          
          this.authService.login(loginCredentials).subscribe({
            next: () => {
              this.isLoading = false;
              this.authService.checkUsers().subscribe(() => {
                this.router.navigate(['/']);
              });
            },
            error: (loginError) => {
              this.isLoading = false;
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
    if (field?.errors) {
      if (field.errors['required']) {
        return this.translate.instant('validation.required');
      }
      if (field.errors['minlength']) {
        return this.translate.instant('validation.minlength', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['passwordMismatch']) {
        return this.translate.instant('initialUser.passwordMismatch');
      }
    }
    return '';
  }
}
