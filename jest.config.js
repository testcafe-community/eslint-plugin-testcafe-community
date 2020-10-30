module.exports = {
  testMatch: ["**/tests/**/*.ts"],
  collectCoverage: true,
  preset: "ts-jest", 
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testPathIgnorePatterns: ["<rootDir>/tests/fixtures/"],
  collectCoverageFrom: ["lib/**/*.ts", "index.ts", "!**/node_modules/**"]
};
