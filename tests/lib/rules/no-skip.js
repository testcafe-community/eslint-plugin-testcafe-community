/**
 * @fileoverview Don&#39;t allow test.skip to be added to the repository
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-skip"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
ruleTester.run("no-skip", rule, {

    valid: [
        `test("foo", () => { })`,
        "fixture`foo`"
    ],

    invalid: [
        {
            code: `test.skip("foo", async t => {
                await t.click(Selector(".foo"))
            })`,
            errors: [{
                message: "Do not use skip",
            }]
        },

        {
            code: "fixture.skip`foo`",
            errors: [{
                message: "Do not use skip",
            }]
        },

        {
            code: "fixture.skip(`foo`)",
            errors: [{
                message: "Do not use skip",
            }]
        }
    ]
});
