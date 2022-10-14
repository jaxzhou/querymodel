module.exports = {
  transform: {
    '^.+\\.(j|t)sx?$': 'ts-jest',
  },
  testTimeout: 15000,
  testRegex: '(/tests/.*(test|spec|e2e))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  coverageReporters: ['text', 'text-summary', 'lcov', 'clover'],
  clearMocks: true,
  setupFiles: ['./.jest.setup.ts'],
  bail: 1,
  roots: ['<rootDir>/tests/'],
}
