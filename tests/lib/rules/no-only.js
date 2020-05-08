/**
 * @fileoverview Don&#39;t allow test.only to be added to the repository
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-only"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
ruleTester.run("no-only", rule, {

    valid: [
        `test("foo", () => { })`,
        "fixture`foo`"
    ],

    invalid: [
        {
            code: `test.only("foo", async t => {
                await t.click(Selector(".foo"))
            })`,
            errors: [{
                message: "Do not use only",
            }]
        }
    ]
});
