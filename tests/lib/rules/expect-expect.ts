/**
 * @fileoverview Don&#39;t allow debug() to be committed to the repository. 
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import rule from "../../../lib/rules/expect-expect";
import {RuleTester} from 'eslint';


import resolveFrom from 'resolve-from';
import { TSESLint } from '@typescript-eslint/experimental-utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
let ruleTester = new TSESLint.RuleTester({     parser: resolveFrom(require.resolve('eslint'), 'espree'),
parserOptions: { ecmaVersion: 8 } });

ruleTester.run("expect-expect", rule, {
    valid: [
        `test("foo", async t => { await t.expect(foo).eql(bar)})`,
        `test.skip("foo", async t => { await t.expect(foo).eql(bar)})`
    ],
    invalid: [
        {
            code: `test("foo", async t => {
                await t.click(button)
            })`,
            errors:[{messageId: "missingExpect"}]
        },
        {
            code: `test.skip("foo", async t => {
                await t.click(button)
            })`,
            errors:[{messageId: "missingExpect"}]
        },
        {
            code: `test.page("./foo")("foo", async t => {
                await t.click(button)
            })`,
            errors:[{messageId: "missingExpect"}]
        },
        {
            code: `test.skip.page("./foo")("foo", async t => {
                await t.click(button)
            })`,
            errors:[{messageId: "missingExpect"}]
        }
    ]
})
