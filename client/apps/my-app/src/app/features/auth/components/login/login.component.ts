import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from '../../../../core/auth/auth.service';
import {LanguageService} from '../../../../shared/services/language.service';
import {LoginRequest} from '../../../users/models/user';
import {closeServerUnavailableDialog} from '../../../../core/http-interceptor';
import {
  AxButtonComponent,
  AxIconComponent
} from '@ui/components';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit
{
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  private dialog = inject(MatDialog);

  ngOnInit(): void
  {
    this.loginForm = this.fb.group({
      userid: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    const currentLang = this.languageService.getCurrentLanguage();

    if (!this.translate.defaultLang)
    {
      this.translate.setDefaultLang('en');
    }

    this.translate.use(currentLang).subscribe(() =>
    {
      this.authService.checkUsers().subscribe(hasUsers =>
      {
        if (!hasUsers)
        {
          this.router.navigate(['/initial-user']);
        }
      });
    });
  }

  onSubmit(): void
  {
    if (this.loginForm.valid)
    {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest =
          {
            userid: this.loginForm.value.userid,
            password: this.loginForm.value.password
          };

      this.authService.login(credentials).subscribe({
        next: () =>
        {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) =>
        {
          this.isLoading = false;
          this.translate.get('login.error').subscribe(translated =>
          {
            this.errorMessage = translated;
          });
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string
  {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required'))
    {
      return 'validation.required';
    }
    if (field?.hasError('minlength'))
    {
      const minLength = field.errors?.['minlength']?.requiredLength || 6;
      return `validation.minlength`.replace('{{min}}', String(minLength));
    }
    return '';
  }

  shutdown(): void
  {
    console.log('=== Shutdown button clicked - LoginComponent ===');
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

    if (window.electronAPI && typeof window.electronAPI.shutdown === 'function')
    {
      try
      {
        window.electronAPI.shutdown();
      }
      catch (error)
      {
        console.error('Error shutting down application:', error);
      }
    }
    else
    {
      console.warn('Electron API not available.');
      if (typeof window.close === 'function')
      {
        window.close();
      }
    }
  }
}
