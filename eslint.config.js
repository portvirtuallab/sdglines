import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astroPlugin from 'eslint-plugin-astro';
import globals from 'globals';

/**
 * ESLint configuration.
 *
 * Deliberately small. Formatting is Prettier's job, type correctness is the
 * TypeScript compiler's job, and accessibility is checked by axe in the
 * end-to-end suite. What is left for ESLint is the class of mistake none of
 * those catch: unused code, unsafe equality, accidental globals.
 */
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
    ],
  },

  js.configs.recommended,

  {
    // Config files and build scripts run in Node; page scripts run in the
    // browser. Declaring both everywhere is less useful than it is convenient,
    // but the alternative is a per-file split that nobody maintains.
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // An unused variable is usually a leftover from an edit that was not
      // finished. Underscore prefix marks a deliberate one.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  ...astroPlugin.configs.recommended,

  {
    // Scripts inside .astro files run in the browser and are processed by Astro
    // rather than by the TypeScript config, so the stricter rules do not apply.
    files: ['**/*.astro/*.ts', '**/*.astro/*.js'],
    rules: {
      'no-undef': 'off',
    },
  },

  {
    files: ['tests/**/*.ts', '*.config.{ts,mjs,js}'],
    rules: {
      'no-console': 'off',
    },
  },
];
