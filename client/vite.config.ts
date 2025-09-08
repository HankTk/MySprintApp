import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      '@ngx-translate/core',
      '@ngx-translate/http-loader',
      '@angular/material',
      '@angular/cdk'
    ]
  },
  server: {
    port: 4200,
    host: 'localhost'
  }
});
