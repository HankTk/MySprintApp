import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'i18n',
  standalone: true,
  pure: false
})
export class I18nPipe implements PipeTransform {
  private translations: { [key: string]: { [key: string]: string } } = {
    en: {
      userManagementSystem: 'User Management System',
      addNewUser: 'Add New User',
      lastName: 'Last Name',
      firstName: 'First Name',
      emailAddress: 'Email Address',
      jsonData: 'JSON Data',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      noUserData: 'No user data available',
      addFirstUser: 'Add First User',
      loadingData: 'Loading data...',
      editUser: 'Edit User',
      addUser: 'Add User',
      lastNamePlaceholder: 'Enter last name',
      firstNamePlaceholder: 'Enter first name',
      emailPlaceholder: 'Enter email address',
      jsonDataPlaceholder: '{"age": 25, "city": "Tokyo", "hobbies": ["reading", "traveling"]}',
      jsonDataHint: 'Please enter valid JSON format',
      cancel: 'Cancel',
      update: 'Update',
      add: 'Add',
      confirmUserDeletion: 'Confirm User Deletion',
      deleteUserMessage: 'Are you sure you want to delete the following user?',
      name: 'Name:',
      email: 'Email:',
      operationIrreversible: 'This operation cannot be undone.',
      confirm: 'Confirm',
      changeLanguage: 'Change Language'
    },
    ja: {
      userManagementSystem: 'ユーザー管理システム',
      addNewUser: '新規ユーザー追加',
      lastName: '姓',
      firstName: '名',
      emailAddress: 'メールアドレス',
      jsonData: 'JSONデータ',
      actions: '操作',
      edit: '編集',
      delete: '削除',
      noUserData: 'ユーザーデータがありません',
      addFirstUser: '最初のユーザーを追加',
      loadingData: 'データを読み込み中...',
      editUser: 'ユーザー編集',
      addUser: 'ユーザー追加',
      lastNamePlaceholder: '姓を入力してください',
      firstNamePlaceholder: '名を入力してください',
      emailPlaceholder: 'メールアドレスを入力してください',
      jsonDataPlaceholder: '{"age": 25, "city": "東京", "hobbies": ["読書", "旅行"]}',
      jsonDataHint: '有効なJSON形式で入力してください',
      cancel: 'キャンセル',
      update: '更新',
      add: '追加',
      confirmUserDeletion: 'ユーザー削除の確認',
      deleteUserMessage: '以下のユーザーを削除しますか？',
      name: '名前:',
      email: 'メールアドレス:',
      operationIrreversible: 'この操作は取り消すことができません。',
              confirm: '削除',
        changeLanguage: '言語を変更'
    }
  };

  constructor(private languageService: LanguageService) {}

  transform(key: string): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return this.translations[currentLang]?.[key] || key;
  }
}
