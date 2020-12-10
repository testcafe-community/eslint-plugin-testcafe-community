/**
 * @fileoverview Don&#39;t allow debug() to be committed to the repository. 
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import rule from "../../../lib/rules/no-debug";
import {RuleTester} from 'eslint';


import resolveFrom from 'resolve-from';
import { TSESLint } from '@typescript-eslint/experimental-utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
let ruleTester = new TSESLint.RuleTester({     parser: resolveFrom(require.resolve('eslint'), 'espree'), parserOptions: { ecmaVersion: 8 } });

let message = 'Do not use the `.debug` action.';
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
                messageId: "noDebugMessage"
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
                messageId: "noDebugMessage"
            }]

        },

        {
            code: `
            test('should do stuff', async (t) => {
                t.debug()
            })
            `,
            errors: [{
                messageId: "noDebugMessage"
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
                messageId: "noDebugMessage"
            }]
        }
    ]
});
