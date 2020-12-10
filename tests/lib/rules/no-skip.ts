/**
 * @fileoverview Don&#39;t allow test.skip to be added to the repository
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import rule from "../../../lib/rules/no-skip"
import {RuleTester} from 'eslint';

import resolveFrom from 'resolve-from';
import { TSESLint } from '@typescript-eslint/experimental-utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

let ruleTester = new TSESLint.RuleTester({     parser: resolveFrom(require.resolve('eslint'), 'espree'), parserOptions: { ecmaVersion: 8 } });

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
                messageId: "noSkip",
            }]
        },
        {
            code: `
            fixture \`foo\`
                .page("http://www.google.com")
                .skip`,
            errors: [{
                messageId: "noSkip",
            }]
        },
        {
            code: `
            fixture \`foo\`
                .page\`http://www.google.com\`
                .skip`,
            errors: [{
                messageId: "noSkip",
            }]
        },
        {
            code: "fixture.skip`foo`",
            errors: [{
                messageId: "noSkip",
            }]
        }, {
            code: "fixture`foo`.skip",
            errors: [{
                messageId: "noSkip",
            }]
        },

        {
            code: "fixture.skip(`foo`)",
            errors: [{
                messageId: "noSkip",
            }]
        }
    ]
});
