module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: [
    'js',
  ],
  testRegex: [
    '_tests_.+\\.spec\\.js',
  ],
  testPathIgnorePatterns: [
    '/.git/',
    '/.idea/',
    '/.run/',
    '/_logs/',
    '/_misc/',
    '/config/',
    '/example/',
    '/node_modules/',
    '/src/',
  ],
  testSequencer: '<rootDir>/__tests__/test-sequencer.js',
  globalSetup: '<rootDir>/__tests__/global-setup.js',
  globalTeardown: '<rootDir>/__tests__/global-teardown.js',
  testTimeout: 30_000,
};
