import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from '../../services/language.service';


@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslateModule],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="languageMenu" 
      class="language-button"
      [matTooltip]="'changeLanguage' | translate">
      <mat-icon>language</mat-icon>
    </button>
    
    <mat-menu #languageMenu="matMenu">
      <button 
        mat-menu-item 
        (click)="switchLanguage('en')"
        [class.active]="languageService.isEnglish()">
        <mat-icon>flag</mat-icon>
        <span>English</span>
      </button>
      <button 
        mat-menu-item 
        (click)="switchLanguage('ja')"
        [class.active]="languageService.isJapanese()">
        <mat-icon>flag</mat-icon>
        <span>日本語</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .language-button {
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        color: #1976d2;
      }
      
      .mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        line-height: 24px;
      }
    }
    
    .active {
      background-color: #e3f2fd;
    }
    
    mat-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      
      .mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        line-height: 20px;
      }
      
      span {
        font-size: 14px;
        font-weight: 500;
      }
    }
    
    .mat-menu-panel {
      min-width: 120px;
    }
  `]
})
export class LanguageSwitcherComponent {
  constructor(public languageService: LanguageService) {}

  switchLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }
}
