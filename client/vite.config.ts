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
    // Note: Direct backend URL is used in user.service.ts
    // Proxy is not needed when using http://localhost:8080 directly
  }
});
