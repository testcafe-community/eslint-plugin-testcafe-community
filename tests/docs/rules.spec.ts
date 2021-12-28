import { access } from "fs-extra";
import { resolve } from "path";
import rulebook from "../../lib/rules";
import type { TestCafeLint } from "../../lib/globals";

describe("Rules", () => {
    const ruleNames = Object.keys(rulebook.rules) as TestCafeLint.RuleName[];

    it.each(ruleNames)(
        "%s should have a documentation file (docs/rules/ruleName.md)",
        async (ruleName) => {
            const ruleDocFile = resolve(
                process.cwd(),
                "docs",
                "rules",
                `${ruleName}.md`
            );
            await expect(access(ruleDocFile)).toResolve();
        }
    );
});
