import { eslintConfig } from '@goncharovv/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...eslintConfig,
  {
    rules: {
      '@stylistic/max-len': ['error', 130],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@stylistic/operator-linebreak': ['error', 'before'],
    },
  },
];
