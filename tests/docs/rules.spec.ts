import { access, readdirSync } from "fs-extra";
import { resolve } from "path";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import rulebook from "../../lib/rules";
import type { TestCafeLint } from "../../lib/globals";

const SECONDS = 1000;
const exec = promisify(execCallback);

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

describe("Rule-doc", () => {
    const getRuleDocFiles = (): string[] => {
        const ruleDocsDir = resolve(__dirname, "..", "..", "docs", "rules");
        const allFilesInDocsDir = readdirSync(ruleDocsDir);
        return allFilesInDocsDir
            .filter((filename) => /(.*\.md)$/.test(filename))
            .map((filename) => resolve(ruleDocsDir, filename));
    };

    it.each(getRuleDocFiles())(
        "%s should be properly formatted markdown",
        async (ruleDoc) => {
            await expect(
                exec(`npx eslint --ext md "${ruleDoc}"`)
            ).resolves.toBeTruthy();
        },
        30 * SECONDS
    );
});
