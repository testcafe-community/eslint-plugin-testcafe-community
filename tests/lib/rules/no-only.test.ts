/**
 * @fileoverview Don&#39;t allow test.only to be added to the repository
 * @author Ben Monro
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import resolveFrom from "resolve-from";
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../../lib/rules/no-only";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});
ruleTester.run("no-only", rule, {
    valid: [`test("foo", () => { })`, "fixture`foo`"],

    invalid: [
        {
            code: `test.only("foo", async t => {
                await t.click(Selector(".foo"))
            })`,
            errors: [
                {
                    messageId: "noOnly"
                }
            ]
        },

        {
            code: `
            fixture \`foo\`
                .page("http://www.google.com")
                .only`,
            errors: [
                {
                    messageId: "noOnly"
                }
            ]
        },
        {
            code: `
            fixture \`foo\`
                .page\`http://www.google.com\`
                .only`,
            errors: [
                {
                    messageId: "noOnly"
                }
            ]
        },
        {
            code: "fixture.only`foo`",
            errors: [
                {
                    messageId: "noOnly"
                }
            ]
        },
        {
            code: "fixture`foo`.only",
            errors: [
                {
                    messageId: "noOnly"
                }
            ]
        }
    ]
});
