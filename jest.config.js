module.exports = {
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 85,
            lines: 90,
            statements: 90,
            functions: 100
        }
    },
    collectCoverageFrom: ["lib/**/*.ts", "index.ts", "!**/node_modules/**"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.jest.json"
        }
    },
    projects: [
        {
            displayName: "UNIT",
            preset: "ts-jest",
            runner: "@codejedi365/jest-serial-runner",
            setupFilesAfterEnv: ["jest-extended/all"],
            testMatch: ["<rootDir>/tests/**/*.spec.ts"]
        },
        {
            displayName: "INTEGRATION",
            preset: "ts-jest",
            runner: "@codejedi365/jest-serial-runner",
            setupFilesAfterEnv: ["jest-extended/all"],
            testMatch: ["<rootDir>/tests/**/*.integration-test.ts"]
        }
    ],
    testPathIgnorePatterns: ["<rootDir>/tests/fixtures/", "<rootDir>/example/"]
};
