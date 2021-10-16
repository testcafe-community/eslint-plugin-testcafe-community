module.exports = {
    projects: [
        {
            displayName: "UNIT",
            testMatch: ["<rootDir>/tests/**/*.test.ts"],
            preset: "ts-jest",
            collectCoverage: true,
            coverageThreshold: {
                "global": {
                    branches: 90,
                    functions: 100,
                    lines: 90,
                    statements: 90
                },
                "./lib/rules/expect-expect.test.ts": {
                    // allow error handling
                    lines: -3,
                    statements: -5
                }
            },
            collectCoverageFrom: [
                "lib/**/*.ts",
                "index.ts",
                "!**/node_modules/**"
            ]
        },
        {
            // Tests to run in serial
            displayName: "INTEGRATION",
            collectCoverage: false,
            preset: "ts-jest",
            runner: "jest-serial-runner",
            // testEnvironment: "node",
            testMatch: ["<rootDir>/tests/**/*.serial-test.ts"]
        }
    ],
    testPathIgnorePatterns: ["<rootDir>/tests/fixtures/", "<rootDir>/example/"]
};
