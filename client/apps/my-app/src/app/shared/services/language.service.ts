import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Observable} from 'rxjs';

export type Language = 'en' | 'ja';

@Injectable({
  providedIn: 'root'
})
export class LanguageService
{
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translateService: TranslateService)
  {
    // Initialize with default language
    this.translateService.setDefaultLang('en');

    // Load language setting from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja'))
    {
      this.setLanguage(savedLanguage);
    }
    else
    {
      this.setLanguage('en');
    }
  }

  getCurrentLanguage(): Language
  {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void
  {
    this.translateService.use(language);
    this.currentLanguageSubject.next(language);
    localStorage.setItem('language', language);
  }

  isEnglish(): boolean
  {
    return this.getCurrentLanguage() === 'en';
  }

  isJapanese(): boolean
  {
    return this.getCurrentLanguage() === 'ja';
  }

  // Get translation for a key
  translate(key: string): Observable<string>
  {
    return this.translateService.get(key);
  }

  // Get translation for a key synchronously (for immediate use)
  instant(key: string): string
  {
    return this.translateService.instant(key);
  }
}
