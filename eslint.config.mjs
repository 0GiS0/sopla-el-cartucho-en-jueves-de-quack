import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
];
