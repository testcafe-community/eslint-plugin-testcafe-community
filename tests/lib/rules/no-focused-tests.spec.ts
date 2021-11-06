/**
 * @fileoverview Don't allow a single test or fixture to take all the focus.
 * @author Ben Monro
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import resolveFrom from "resolve-from";
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../../lib/rules/no-focused-tests";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});
ruleTester.run("no-focused-tests", rule, {
    valid: [`test("foo", () => { })`, "fixture`foo`"],

    invalid: [
        {
            code: `test.only("foo", async t => {
                await t.click(Selector(".foo"))
            })`,
            errors: [{ messageId: "no-focused-tests" }]
        },

        {
            code: `
            fixture \`foo\`
                .page("http://www.google.com")
                .only`,
            errors: [{ messageId: "no-focused-tests" }]
        },
        {
            code: `
            fixture \`foo\`
                .page\`http://www.google.com\`
                .only`,
            errors: [{ messageId: "no-focused-tests" }]
        },
        {
            code: "fixture.only`foo`",
            errors: [{ messageId: "no-focused-tests" }]
        },
        {
            code: "fixture`foo`.only",
            errors: [{ messageId: "no-focused-tests" }]
        }
    ]
});
