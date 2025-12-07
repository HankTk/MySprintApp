import { Component, inject, Input, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, Language } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy, AfterViewInit
{
  @Input() showLabel = true;
  @ViewChild('languageSelect', { static: false }) languageSelect!: MatSelect;
  
  languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  currentLanguage: Language = 'en';
  private subscription = new Subscription();

  languages = [
    { value: 'en' as Language, label: 'english', icon: 'flag' },
    { value: 'ja' as Language, label: 'japanese', icon: 'flag' }
  ];

  ngOnInit(): void {
    // Initialize with current language
    this.currentLanguage = this.languageService.getCurrentLanguage();
    
    // Subscribe to language changes to keep select in sync
    this.subscription.add(
      this.languageService.currentLanguage$.subscribe(lang => {
        if (this.currentLanguage !== lang) {
          this.currentLanguage = lang;
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Set panel width to match trigger width
    if (this.languageSelect) {
      this.languageSelect.openedChange.subscribe((opened: boolean) => {
        if (opened) {
          setTimeout(() => {
            const panel = document.querySelector('.language-select-panel') as HTMLElement;
            const formField = document.querySelector('.language-select-field .mat-mdc-form-field') as HTMLElement;
            if (panel && formField) {
              const triggerWidth = formField.offsetWidth;
              panel.style.width = triggerWidth + 'px';
              panel.style.minWidth = triggerWidth + 'px';
              panel.style.maxWidth = triggerWidth + 'px';
            }
          }, 0);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLanguageChange(newLanguage: Language): void {
    console.log('Language change triggered:', newLanguage);
    if (newLanguage && (newLanguage === 'en' || newLanguage === 'ja')) {
      this.languageService.setLanguage(newLanguage);
      this.currentLanguage = newLanguage;
    }
  }
}
