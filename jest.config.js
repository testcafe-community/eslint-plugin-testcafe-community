module.exports = {
    collectCoverage: true,
    coverageThreshold: {
        "global": {
            branches: 85,
            lines: 90,
            statements: 90,
            functions: 100
        },
        "./lib/rules/expect-expect.ts": {
            // allow error handling
            lines: -3,
            statements: -5
        }
    },
    collectCoverageFrom: ["lib/**/*.ts", "index.ts", "!**/node_modules/**"],
    projects: [
        {
            displayName: "UNIT",
            testMatch: ["<rootDir>/tests/**/*.test.ts"],
            preset: "ts-jest"
        },
        {
            // Tests to run in serial
            displayName: "INTEGRATION",
            preset: "ts-jest",
            runner: "@codejedi365/jest-serial-runner",
            testMatch: ["<rootDir>/tests/**/*.serial-test.ts"]
        }
    ],
    testPathIgnorePatterns: ["<rootDir>/tests/fixtures/", "<rootDir>/example/"]
};
