const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'integrations/**',
      'scripts/**',
      'jest.setup.js',
      '.github/**',
      'coverage/**',
      'node_modules/**',
      'src/**/__tests__/**',
    ],
  },
]);
