import fecPlugin from '@redhat-cloud-services/eslint-config-redhat-cloud-services';
import { defineConfig, globalIgnores } from 'eslint/config';
import pluginCypress from 'eslint-plugin-cypress/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import jsdoc from 'eslint-plugin-jsdoc';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

const flatPlugins = [
  fecPlugin,
  pluginCypress.configs.recommended,
  reactHooks.configs['recommended-latest'],
  jsdoc.configs['flat/recommended'],
  testingLibrary.configs['flat/react'],
  jestDom.configs['flat/recommended'],
];

export default defineConfig([
  globalIgnores(['node_modules/*', 'static/*', 'dist/*', 'docs/*']),
  ...flatPlugins,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cy.js'],
    languageOptions: {
      globals: {
        insights: 'readonly',
        shallow: 'readonly',
        render: 'readonly',
        mount: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      // Add other TypeScript-specific rules here
    },
  },
  {
    rules: {
      'rulesdir/disallow-fec-relative-imports': 'off',
      'rulesdir/forbid-pf-relative-imports': 'off',
      'cypress/unsafe-to-chain-command': 'off',
      'jsdoc/tag-lines': 0,
      'jsdoc/require-jsdoc': 0,
      'jsdoc/check-line-alignment': [
        'error',
        'always',
        {
          customSpacings: {
            postDelimiter: 2,
          },
        },
      ],
      'jsdoc/check-tag-names': [
        'warn',
        {
          definedTags: ['category', 'subcategory'],
        },
      ],
      // Add other non-TypeScript specific rules here
    },
  },
]);
