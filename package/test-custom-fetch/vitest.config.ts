import { defineConfig } from 'vitest/config'
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      "@demo-api-infra/custom-fetch": path.resolve(__dirname, '../custom-fetch')
    }
  }
});
