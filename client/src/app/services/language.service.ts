import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'ja';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    // Load language setting from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja')) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('language', language);
    
    // Notify language change (without page reload)
    this.currentLanguageSubject.next(language);
  }

  isEnglish(): boolean {
    return this.getCurrentLanguage() === 'en';
  }

  isJapanese(): boolean {
    return this.getCurrentLanguage() === 'ja';
  }
}
