import globals from 'globals';
import js from '@eslint/js';
import css from '@eslint/css';

export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-undef': 'error', // Wykrywa niezdefiniowane zmienne (np. użycie zmiennej bez deklaracji)
      'no-const-assign': 'error', // Wykrywa nadpisywanie const
    },
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    rules: {
      ...css.configs.recommended.rules,
    },
  },
];