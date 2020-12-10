import rule from "../../../lib/rules/no-identical-title";
import {RuleTester} from 'eslint';


import resolveFrom from 'resolve-from';
import { TSESLint } from '@typescript-eslint/experimental-utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
let ruleTester = new TSESLint.RuleTester({     parser: resolveFrom(require.resolve('eslint'), 'espree'), parserOptions: { ecmaVersion: 8 } });

let message = 'Do not use the `.debug` action.';
ruleTester.run("no-debug", rule, {
    valid:[
        `
        test("my test", async t => {});
        test("my other test", async t => {});
        `
    ],
    invalid: [
        {
        code: `
        test("my test", async t => {});
        test("my test", async t => {});
        `,
        errors: [{messageId: "noIdenticalTitles"},{messageId: "noIdenticalTitles"}]
        }
    ]
});

