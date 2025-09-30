import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    exclude: ['**/node_modules/**', '**/e2e/**', 'e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
})
