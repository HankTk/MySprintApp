import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User, CreateUserRequest } from '../../models/user';

export interface UserDialogData {
  user?: User;
  isEdit: boolean;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserDialogComponent>);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? 'ユーザー情報編集' : '新規ユーザー登録';
    
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      jsonData: ['{}', [Validators.required, this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private populateForm(user: User): void {
    // JSONデータを文字列として編集用に準備
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jsonData: jsonDataString
    });
  }

  // JSONバリデーター
  private jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // JSONデータを適切に処理
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.user) {
        // 編集の場合
        const userToUpdate: User = {
          id: this.data.user.id,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', user: userToUpdate });
      } else {
        // 新規追加の場合
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

  onCancel(): void {
    this.dialogRef.close();
  }

  // フォームのバリデーション状態を取得
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'この項目は必須です';
      }
      if (field.errors['email']) {
        return '有効なメールアドレスを入力してください';
      }
      if (field.errors['minlength']) {
        return `最小${field.errors['minlength'].requiredLength}文字で入力してください`;
      }
      if (field.errors['invalidJson']) {
        return '有効なJSON形式で入力してください';
      }
    }
    return '';
  }
}
