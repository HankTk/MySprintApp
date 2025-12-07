import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService
{
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();
  
  // Signal for reactive theme changes
  private themeSignal = signal<Theme>('light');

  constructor()
  {
    // Initialize theme
    this.initializeTheme();

    // Apply theme when it changes
    effect(() => {
      const theme = this.themeSignal();
      this.applyTheme(theme);
    });
  }

  private initializeTheme(): void
  {
    // Load theme setting from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark'))
    {
      this.themeSignal.set(savedTheme);
      this.currentThemeSubject.next(savedTheme);
      this.applyTheme(savedTheme);
    }
    else
    {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      this.themeSignal.set(initialTheme);
      this.currentThemeSubject.next(initialTheme);
      this.applyTheme(initialTheme);
    }
  }

  getCurrentTheme(): Theme
  {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void
  {
    this.currentThemeSubject.next(theme);
    this.themeSignal.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void
  {
    const body = document.body;
    const html = document.documentElement;
    
    if (theme === 'dark')
    {
      body.classList.add('dark-theme');
      html.classList.add('dark-theme');
    }
    else
    {
      body.classList.remove('dark-theme');
      html.classList.remove('dark-theme');
    }
  }

  isLight(): boolean
  {
    return this.getCurrentTheme() === 'light';
  }

  isDark(): boolean
  {
    return this.getCurrentTheme() === 'dark';
  }

  toggleTheme(): void
  {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
