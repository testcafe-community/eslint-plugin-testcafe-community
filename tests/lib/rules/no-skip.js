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

let ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
let message = 'Do not use the `.skip` hook.';
ruleTester.run("no-skip", rule, {

    valid: [
        `test("foo", () => { })`,
        "fixture`foo`",
        "fixture`foo`.page",
    ],

    invalid: [
        {
            code: `test.skip("foo", async t => {
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
                .skip`,
            errors: [{
                message,
            }]
        },
        {
            code: `
            fixture \`foo\`
                .page\`http://www.google.com\`
                .skip`,
            errors: [{
                message,
            }]
        },
        {
            code: "fixture.skip`foo`",
            errors: [{
                message,
            }]
        }, {
            code: "fixture`foo`.skip",
            errors: [{
                message,
            }]
        },

        {
            code: "fixture.skip(`foo`)",
            errors: [{
                message,
            }]
        }
    ]
});
