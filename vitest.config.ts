import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Vitest configuration.
 *
 * The path aliases have to be repeated here because Vitest does not read
 * tsconfig paths. They are kept identical to tsconfig.json; a mismatch shows up
 * immediately as an unresolved import.
 */
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': `${root}src`,
      '@components': `${root}src/components`,
      '@layouts': `${root}src/layouts`,
      '@data': `${root}src/data`,
      '@lib': `${root}src/lib`,
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    reporters: 'default',
  },
});
