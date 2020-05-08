/**
 * @fileoverview Don&#39;t allow debug() to be committed to the repository. 
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-debug"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------


var ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 8 } });
ruleTester.run("no-debug", rule, {

    valid: [

        `t.click()`,
        `t.debugger()`,
        `t.typeText(Selector(".debug"), "Hello")`
    ],

    invalid: [
        {
            code: "t.debug()",
            errors: [{
                message: "Do not use debug"
            }]
        },
        {
            code: `
            test('should do stuff', async (t) => {
                await t
                .click(Selector("foo"))
                .debug()
            })
            `,
            errors: [{
                message: "Do not use debug"
            }]

        },

        {
            code: `
            test('should do stuff', async (t) => {
                t.debug()
            })
            `,
            errors: [{
                message: "Do not use debug"
            }]

        },
        {
            code: `
            fixture\`foo\`.beforeEach( async (t) => {
                await t
                .click(Selector("foo"))
                .debug()
            })
            `,
            errors: [{
                message: "Do not use debug"
            }]
        }
    ]
});
