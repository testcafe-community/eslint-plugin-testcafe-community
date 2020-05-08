module.exports = {
  testMatch: ["**/tests/**/*.js"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testPathIgnorePatterns: ["<rootDir>/tests/fixtures/"],
  collectCoverageFrom: ["lib/**/*.js", "!**/node_modules/**"]
};
