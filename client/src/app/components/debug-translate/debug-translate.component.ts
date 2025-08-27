import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-debug-translate',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div style="padding: 20px; border: 1px solid #ccc; margin: 20px;">
      <h3>Translation Debug</h3>
      
      <h4>Direct Translation:</h4>
      <p>English: {{ 'userManagementSystem' | translate }}</p>
      <p>Japanese: {{ 'addNewUser' | translate }}</p>
      
      <h4>Service Translation:</h4>
      <p>Current Language: {{ currentLanguage }}</p>
      <p>Default Language: {{ defaultLanguage }}</p>
      <p>Available Languages: {{ availableLanguages.join(', ') }}</p>
      
      <h4>Language Switch Test:</h4>
      <button (click)="switchToEnglish()">Switch to English</button>
      <button (click)="switchToJapanese()">Switch to Japanese</button>
      
      <h4>Raw Translation Data:</h4>
      <pre>{{ translationData | json }}</pre>
    </div>
  `,
  styles: []
})
export class DebugTranslateComponent implements OnInit {
  currentLanguage: string = '';
  defaultLanguage: string = '';
  availableLanguages: string[] = [];
  translationData: any = {};

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.currentLanguage = this.translateService.currentLang || 'not set';
    this.defaultLanguage = this.translateService.getDefaultLang() || 'not set';
    this.availableLanguages = [...(this.translateService.getLangs() || [])];
    
    // Test getting a translation
    this.translateService.get('userManagementSystem').subscribe(
      (translation) => {
        this.translationData = { 'userManagementSystem': translation };
        console.log('Translation result:', translation);
      },
      (error) => {
        console.error('Translation error:', error);
        this.translationData = { error: error.message };
      }
    );
  }

  switchToEnglish() {
    this.translateService.use('en');
    this.currentLanguage = this.translateService.currentLang || 'not set';
  }

  switchToJapanese() {
    this.translateService.use('ja');
    this.currentLanguage = this.translateService.currentLang || 'not set';
  }
}
