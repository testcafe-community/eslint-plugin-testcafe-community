import type {
    RuleListener,
    RuleModule,
    Linter
} from "@typescript-eslint/experimental-utils/dist/ts-eslint";

declare namespace TestCafeLint {
    type RuleName =
        | "missing-expect"
        | "no-debug"
        | "no-disabled-tests"
        | "no-duplicate-titles"
        | "no-focused-tests";

    type Rules = {
        [rule in RuleName]: RuleModule<string, unknown[], RuleListener>;
    };

    type RuleRecords = {
        [rule in RuleName]: Linter.RuleEntry;
    };

    namespace Config {
        interface Recommended extends Linter.Config {
            globals: {
                fixture: boolean;
                test: boolean;
            };
            plugins: ["testcafe-community"];
            rules: Partial<RuleRecords>;
        }
    }
}

// Entrypoint exports
export const rules: TestCafeLint.Rules;
export const configs: {
    readonly recommended: TestCafeLint.Config.Recommended;
};
