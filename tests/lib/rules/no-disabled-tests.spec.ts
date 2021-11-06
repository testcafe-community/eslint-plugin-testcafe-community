/**
 * @fileoverview Prevent tests from being disabled by `fixture.skip()` or `test.skip()` and forgotten.
 * @author Ben Monro
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import resolveFrom from "resolve-from";
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../../lib/rules/no-disabled-tests";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});

ruleTester.run("no-disabled-tests", rule, {
    valid: [
        `test("foo", async () => { })`,
        "fixture`foo`",
        "fixture`foo`.page('http://www.example.com/')"
    ],
    invalid: [
        {
            code: `test.skip("foo", async t => {
                await t.click(Selector(".foo"))
            })`,
            errors: [
                {
                    messageId: "no-disabled-tests"
                }
            ]
        },
        {
            code: `
            fixture \`foo\`
                .page("http://www.google.com")
                .skip
            `,
            errors: [{ messageId: "no-disabled-tests" }]
        },
        {
            code: `
            fixture \`foo\`
                .page\`http://www.google.com\`
                .skip`,
            errors: [{ messageId: "no-disabled-tests" }]
        },
        {
            code: "fixture.skip`foo`",
            errors: [{ messageId: "no-disabled-tests" }]
        },
        {
            code: "fixture`foo`.skip",
            errors: [{ messageId: "no-disabled-tests" }]
        },
        {
            code: "fixture.skip(`foo`)",
            errors: [{ messageId: "no-disabled-tests" }]
        }
    ]
});
