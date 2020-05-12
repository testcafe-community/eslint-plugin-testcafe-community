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


let ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
let message = "Do not use the `.only` hook.";
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
                message,
            }]
        },

        {
            code: `
            fixture \`foo\`
                .page("http://www.google.com")
                .only`,
            errors: [{
                message,
            }]
        },
        {
            code: `
            fixture \`foo\`
                .page\`http://www.google.com\`
                .only`,
            errors: [{
                message,
            }]
        },
        {
            code: "fixture.only`foo`",
            errors: [{
                message,
            }]
        }, {
            code: "fixture`foo`.only",
            errors: [{
                message,
            }]
        },
    ]
});
