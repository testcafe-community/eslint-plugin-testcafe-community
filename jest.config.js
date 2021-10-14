module.exports = {
    preset: "ts-jest",
    projects: [
        {
            displayName: "unit-tests",
            testMatch: ["tests/**/*.test.ts"],
            collectCoverage: true,
            coverageThreshold: {
                "global": {
                    branches: 90,
                    functions: 100,
                    lines: 90,
                    statements: 90
                },
                "./lib/rules/expect-expect.ts": {
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
            displayName: "integration-tests",
            collectCoverage: false,
            runner: "jest-serial-runner",
            // testEnvironment: "node",
            testMatch: ["tests/**/*.serial-test.ts"]
        }
    ],
    testPathIgnorePatterns: ["<rootDir>/tests/fixtures/", "<rootDir>/example/"]
};
