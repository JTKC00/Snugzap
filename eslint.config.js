import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'artifacts'] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['scripts/*.mjs', 'vite.config.ts'],
    languageOptions: { globals: {
      process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly',
      WebSocket: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
    } },
  },
)
