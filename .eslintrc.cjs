module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['@typescript-eslint', 'local-rules'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // Our custom rule flags top-level imports from next-auth/react
    'local-rules/no-top-level-next-auth-react': 'error'
  },
  settings: {},
  env: {
    node: true,
    browser: true,
    es2024: true
  }
}
