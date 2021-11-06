/**
 * @fileoverview Prevent permanent use of `t.debug()`.
 * @author Ben Monro
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import resolveFrom from "resolve-from";
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../../lib/rules/no-debug";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});

ruleTester.run("no-debug", rule, {
    valid: [
        `t.click()`,
        `t.debugger()`,
        `t.typeText(Selector(".debug"), "Hello")`
    ],
    invalid: [
        {
            code: "t.debug()",
            errors: [{ messageId: "no-debug" }]
        },
        {
            code: `
            test('should do stuff', async (t) => {
                await t
                .click(Selector("foo"))
                .debug()
            })
            `,
            errors: [{ messageId: "no-debug" }]
        },
        {
            code: `
            test('should do stuff', async (t) => {
                t.debug()
            })
            `,
            errors: [{ messageId: "no-debug" }]
        },
        {
            code: `
            fixture\`foo\`.beforeEach( async (t) => {
                await t
                .click(Selector("foo"))
                .debug()
            })
            `,
            errors: [{ messageId: "no-debug" }]
        }
    ]
});
