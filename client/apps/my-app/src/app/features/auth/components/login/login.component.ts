import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { LanguageService } from '../../../../shared/services/language.service';
import { LoginRequest } from '../../../users/models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);

  ngOnInit(): void {
    // Ensure LanguageService is initialized (this will initialize TranslateService)
    // and ensure we're using the current language
    const currentLang = this.languageService.getCurrentLanguage();
    
    // Ensure default language is set
    if (!this.translate.defaultLang) {
      this.translate.setDefaultLang('en');
    }
    
    // Use current language and ensure translations are loaded
    this.translate.use(currentLang).subscribe(() => {
      // Translations are now loaded
    });

    this.loginForm = this.fb.group({
      userid: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Check if users exist, if not redirect to initial user creation
    this.authService.checkUsers().subscribe(hasUsers => {
      if (!hasUsers) {
        this.router.navigate(['/initial-user']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = {
        userid: this.loginForm.value.userid,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          // Always use the translated error message
          this.translate.get('login.error').subscribe(translated => {
            this.errorMessage = translated;
          });
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'validation.required';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength || 6;
      return `validation.minlength`.replace('{{min}}', String(minLength));
    }
    return '';
  }

  shutdown(): void {
    console.log('Shutdown button clicked');
    console.log('window.electronAPI:', window.electronAPI);
    
    if (window.electronAPI && typeof window.electronAPI.shutdown === 'function') {
      try {
        console.log('Calling electronAPI.shutdown()');
        window.electronAPI.shutdown();
      } catch (error) {
        console.error('Error shutting down application:', error);
      }
    } else {
      console.warn('Electron API not available. Application may not be running in Electron.');
      // Fallback: try to close the window if in browser
      if (typeof window.close === 'function') {
        window.close();
      }
    }
  }
}
