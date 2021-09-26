import { rules, generateRecommendedConfig } from "../../lib";
import "jest-extended";

it("should have all the rules", () => {
    expect(Object.keys(rules).length).toBeGreaterThan(0);
});

it.each(Object.keys(rules))("%s should export required fields", (ruleName) => {
    const rule = rules[ruleName];
    expect(rule).toHaveProperty("create", expect.any(Function));
    expect(rule.meta.docs?.url).not.toBeEmpty();
    expect(rule.meta.docs?.category).toBe("Best Practices");
    expect(rule.meta.docs?.description).not.toBeEmpty();
});
it("should have a recommended config with recommended rules", () => {
    expect(generateRecommendedConfig()).toEqual({
        "testcafe-community/expectExpect": "error",
        "testcafe-community/noDebug": "error",
        "testcafe-community/noIdenticalTitle": "error",
        "testcafe-community/noOnly": "error",
        "testcafe-community/noSkip": "warn"
    });
});
