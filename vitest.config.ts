/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 20000,
    exclude: [
      'node_modules/**',
      'dist/**',
      'dist-packages/**',
      'src-tauri/**',
      'GIT_SYNC_SOURCE/**',
      'GIT_SYNC_GITHUB/**',
      'QZbak/**',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'src-tauri/',
      ],
    },
  },
})