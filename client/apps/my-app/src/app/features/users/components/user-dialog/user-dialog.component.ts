import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { User, CreateUserRequest } from '../../models/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { 
  AxButtonComponent, 
  AxIconComponent, 
  AxInputComponent, 
  AxSelectComponent,
  AxTextareaComponent 
} from '@ui/components';

export interface UserDialogData {
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
    TranslateModule,
    AxButtonComponent,
    AxIconComponent,
    AxInputComponent,
    AxSelectComponent,
    AxTextareaComponent
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;
  
  roleOptions = [
    { value: '', label: 'Select Role' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Basic', label: 'Basic' }
  ];

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editUser') : this.translate.instant('addUser');
    
    this.userForm = this.fb.group({
      userid: ['', [Validators.required, Validators.minLength(1)]],
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      jsonData: ['{}', [Validators.required, this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.user) {
      this.populateForm(this.data.user);
    }
    this.updateRoleOptions();
  }

  private updateRoleOptions(): void {
    this.roleOptions = [
      { value: '', label: this.translate.instant('rolePlaceholder') },
      { value: 'Admin', label: this.translate.instant('roleOptions.admin') },
      { value: 'Basic', label: this.translate.instant('roleOptions.basic') }
    ];
  }

  private populateForm(user: User): void {
    let jsonDataString = '{}';
    if (user.jsonData) {
      if (typeof user.jsonData === 'object') {
        jsonDataString = JSON.stringify(user.jsonData, null, 2);
      } else if (typeof user.jsonData === 'string') {
        try {
          JSON.parse(user.jsonData);
          jsonDataString = user.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.userForm.patchValue({
      userid: user.userid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      jsonData: jsonDataString
    });
  }

  private jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  get isEnglish(): boolean {
    return this.languageService.isEnglish();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.user) {
        const userToUpdate: User = {
          id: this.data.user.id,
          userid: formValue.userid,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          role: formValue.role,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', user: userToUpdate });
      } else {
        const userToCreate: CreateUserRequest = {
          userid: formValue.userid,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          role: formValue.role,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', user: userToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.translate.instant('validation.required');
      }
      if (field.errors['email']) {
        return this.translate.instant('validation.email');
      }
      if (field.errors['minlength']) {
        return this.translate.instant('validation.minlength', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}
