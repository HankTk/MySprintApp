import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeJa from '@angular/common/locales/ja';

// Register locale data
registerLocaleData(localeEn, 'en');
registerLocaleData(localeJa, 'ja');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
