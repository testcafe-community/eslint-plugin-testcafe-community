import fs from "fs/promises";
import { resolve } from "path";
import rulebook from "../../lib/rules";
import { configs } from "../../lib";
import "jest-extended";

let rulesSpy: jest.SpyInstance;

beforeEach(() => {
    rulesSpy = jest.spyOn(rulebook, "rules", "get");
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("Rule Definitions", () => {
    it("should export at least one rule", () => {
        expect(Object.keys(rulebook.rules).length).toBeGreaterThan(0);
    });

    it("should include all rule defintions", async () => {
        const allFilesInRulesDir = await fs.readdir(
            resolve(__dirname, "..", "..", "lib", "rules")
        );
        const allRuleFiles = allFilesInRulesDir.filter((filename) =>
            /(.*(?<!^index)\.ts)$/.test(filename)
        );
        expect(Object.keys(rulebook.rules)).toBeArrayOfSize(
            allRuleFiles.length
        );
    });

    it.each(Object.keys(rulebook.rules))(
        "%s should export required fields",
        (ruleName) => {
            const rule = rulebook.rules[ruleName];
            expect(rule).toHaveProperty("create", expect.any(Function));
            expect(rule.meta.docs?.url).not.toBeEmpty();
            expect(rule.meta.docs?.category).toBe("Best Practices");
            expect(rule.meta.docs?.description).not.toBeEmpty();
        }
    );
});

describe("recommended config", () => {
    it("should include the testcafe expected global variables in context", () => {
        expect(configs.recommended.globals).toEqual({
            fixture: false,
            test: false
        });
    });

    it("should specify this plugin in the plugins list", () => {
        expect(configs.recommended.plugins).toEqual(["testcafe-community"]);
    });

    it("should include the recommended rules from this plugin", () => {
        expect(configs.recommended.rules).toEqual({
            "testcafe-community/expectExpect": "error",
            "testcafe-community/noDebug": "error",
            "testcafe-community/noIdenticalTitle": "error",
            "testcafe-community/noOnly": "error",
            "testcafe-community/noSkip": "warn"
        });
    });

    it("should not include rule in the recommended config if RuleMetaDocs is obmitted", () => {
        const allRules = rulebook.rules;
        rulesSpy.mockImplementation(() => {
            const ruleEntry = Object.entries(allRules)[0];
            const aRecommendedRule = JSON.parse(
                JSON.stringify(ruleEntry[1])
            ) as typeof ruleEntry[1];
            delete aRecommendedRule.meta.docs;
            return { [ruleEntry[0]]: aRecommendedRule };
        });
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const thisModule = require("../../lib") as typeof import("../../lib");
        expect(
            Object.keys(thisModule.configs.recommended.rules || {})
        ).toBeArrayOfSize(0);
    });
});
