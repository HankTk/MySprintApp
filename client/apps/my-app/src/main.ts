import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

// Polyfill for global variable (required by sockjs-client)
if (typeof (globalThis as any).global === 'undefined')
{
  (globalThis as any).global = globalThis;
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient)
{
  return {
    getTranslation: (lang: string) =>
    {
      return http.get(`./assets/i18n/${lang}.json`);
    }
  } as TranslateLoader;
}

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideZoneChangeDetection(),...appConfig.providers,
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    },
    ...TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }).providers!
  ]
})
  .catch((err) => console.error(err));
