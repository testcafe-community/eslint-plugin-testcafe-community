import resolveFrom from "resolve-from";
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../../lib/rules/no-identical-title";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});

ruleTester.run("noIdenticalTitles", rule, {
    valid: [
        `
        test("my test", async t => {});
        test("my other test", async t => {});
        `,
        `
        test.page("./foo")("my test", async t => {});
        test.page("./foo")("my other test", async t => {});
        `,
        `
        test("my test", async t => {});
        test.page("./foo")("my other test", async t => {});
        `,
        `
        test("my test", async t => {});
        test.skip("my other test", async t => {});
        `,
        `
        test("my test", async t => {});
        test.only.page("./foo")("my other test", async t => {});
        `,
        `
        test("my test", async t => {});
        test.before(async t => {
            await t.wait(1000);
        })("my other test", async t => {});
        `,
        `
        test.before(async t => {
            await t.wait(1000);
        })("my test", async t => {});

        test.before(async t => {
            await t.wait(1000);
        })("my other test", async t => {});
        `,
        // ignore undeterminable code (don't throw an error, not this rule's focus)
        `test(/^regex_name/, async t => {});`,
        `test(null, async t => {})`,
        `test(getTestName("F-0001"), async t => {});`
    ],
    invalid: [
        {
            code: `
                test("my test", async t => {});
                test("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        },
        {
            code: `
                test.page("./foo")("my test", async t => {});
                test.page("./foo")("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        },
        {
            code: `
                test("my test", async t => {});
                test.page("./foo")("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        },
        {
            code: `
                test("my test", async t => {});
                test.skip("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        },
        {
            code: `
                test("my test", async t => {});
                test.only.page("./foo")("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        },
        {
            code: `
                test("my test", async t => {});
                test.before(async t => {
                    await t.wait(1000);
                })("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        },
        {
            code: `
                test.before(async t => {
                    await t.wait(1000);
                })("my test", async t => {});
                
                test.before(async t => {
                    await t.wait(1000);
                })("my test", async t => {});
            `,
            errors: [
                { messageId: "noIdenticalTitles" },
                { messageId: "noIdenticalTitles" }
            ]
        }
    ]
});
