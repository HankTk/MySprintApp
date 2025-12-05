import { Component, Inject, OnInit, inject } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User, CreateUserRequest } from '../../models/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';

export interface UserDialogData
{
  user?: User;
  isEdit: boolean;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit
{
  userForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData)
  {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editUser') : this.translate.instant('addUser');
    
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      jsonData: ['{}', [Validators.required, this.jsonValidator]]
    });
  }

  ngOnInit(): void
  {
    if (this.isEdit && this.data.user)
    {
      this.populateForm(this.data.user);
    }
  }

  private populateForm(user: User): void
  {
    // Prepare JSON data as string for editing
    let jsonDataString = '{}';
    if (user.jsonData)
    {
      if (typeof user.jsonData === 'object')
      {
        jsonDataString = JSON.stringify(user.jsonData, null, 2);
      }
      else if (typeof user.jsonData === 'string')
      {
        try
        {
          JSON.parse(user.jsonData);
          jsonDataString = user.jsonData;
        }
        catch
        {
          jsonDataString = '{}';
        }
      }
    }

    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jsonData: jsonDataString
    });
  }

  // JSON validator
  private jsonValidator(control: any)
  {
    if (!control.value) return null;
    try
    {
      JSON.parse(control.value);
      return null;
    }
    catch (e)
    {
      return { invalidJson: true };
    }
  }

  get isEnglish(): boolean {
    return this.languageService.isEnglish();
  }

  onSubmit(): void
  {
    if (this.userForm.valid)
    {
      const formValue = this.userForm.value;
      
      // Process JSON data appropriately
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}')
      {
        try
        {
          jsonData = JSON.parse(formValue.jsonData);
        }
        catch (e)
        {
          return;
        }
      }

      if (this.isEdit && this.data.user)
      {
        // For editing
        const userToUpdate: User = {
          id: this.data.user.id,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', user: userToUpdate });
      }
      else
      {
        // For new addition
        const userToCreate: CreateUserRequest = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', user: userToCreate });
      }
    }
  }

  onCancel(): void
  {
    this.dialogRef.close();
  }

  // Get form validation status
  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
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
      if (field.errors['email'])
      {
        return this.translate.instant('validation.email');
      }
      if (field.errors['minlength'])
      {
        return this.translate.instant('validation.minlength', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['invalidJson'])
      {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}
