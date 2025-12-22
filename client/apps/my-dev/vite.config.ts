/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { angular } from '@analogjs/vite-plugin-angular';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/my-dev',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'favicon.ico']),
    angular()
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/my-dev',
      provider: 'vite-v8'
    }
  }
});

