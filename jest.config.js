const tsJestPresets = {
    preset: "ts-jest",
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.jest.json"
        }
    }
};

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
    collectCoverageFrom: [
        "lib/**/*.ts",
        "!lib/**/*.d.ts",
        "!**/node_modules/**"
    ],
    projects: [
        {
            displayName: "UNIT",
            ...tsJestPresets,
            runner: "@codejedi365/jest-serial-runner",
            setupFilesAfterEnv: ["jest-extended/all"],
            testPathIgnorePatterns: ["/node_modules/", "<rootDir>/tests/docs/"],
            testMatch: ["**/tests/**/*.spec.ts"]
        },
        {
            displayName: "INTEGRATION",
            ...tsJestPresets,
            runner: "@codejedi365/jest-serial-runner",
            setupFilesAfterEnv: ["jest-extended/all"],
            testMatch: ["<rootDir>/tests/**/*.integration-test.ts"]
        },
        {
            displayName: "DOCUMENTATION",
            ...tsJestPresets,
            runner: "@codejedi365/jest-serial-runner",
            setupFilesAfterEnv: ["jest-extended/all"],
            testMatch: ["<rootDir>/tests/docs/**/*.spec.ts"]
        }
    ],
    testPathIgnorePatterns: ["<rootDir>/tests/fixtures/", "<rootDir>/example/"]
};
