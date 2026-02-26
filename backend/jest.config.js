module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/config/*.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 60,
      lines: 70,
      statements: 70
    }
  },
  coverageDirectory: 'coverage',
  verbose: true
};
