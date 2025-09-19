import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
