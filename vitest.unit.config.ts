import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'jsdom',
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage/unit',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
