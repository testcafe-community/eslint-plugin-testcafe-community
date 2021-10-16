/**
 * @fileoverview Don&#39;t allow debug() to be committed to the repository.
 * @author Ben Monro
 * @author codejedi365
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import resolveFrom from "resolve-from";
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../../lib/rules/expect-expect";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});

ruleTester.run("expect-expect", rule, {
    valid: [
        `test("foo", async t => { await t.expect(foo).eql(bar) })`,
        `test.skip("foo", async t => { await t.expect(foo).eql(bar) })`,
        `test.page("./foo")("foo", async t => { await t.expect(foo).eql(bar) })`,
        `test.only.page("./foo")("foo", async t => { await t.expect(foo).eql(bar) })`,
        // Chained expect
        `test("foo", async t => {
            await t
                .click(button)
                .expect(foo)
                .eql(bar)
        })`,
        // More than 1 function on t
        `test("foo", async t => {
            await t.click(button)
            await t.expect(foo).eql(bar)
        })`,
        // Multiple expects
        `test("foo", async t => {
            await t.click(button)
            await t.expect(foo).eql(bar)
            await t.expect(true).ok()
        })`,
        // chained function with callback parameter
        `test.before(async t => {
            await t.useRole(adminRole).wait(1000);
        })("foo", async t => {
            await t.click(button);
            await t.expect(foo).eql(bar);
        })`,
        // Multiple tests
        `fixture("My Fixture")
            .page("https://example.com");

        test("test1", async t => {
            await t.useRole(adminRole);
            await t.expect(foo).eql(bar);
        });
        test("test2", async t => {
            await t.click(button);
            await t.expect(foo).eql(bar);
        });`
    ],
    invalid: [
        {
            code: `test("foo", async t => {
                await t.click(button)
            })`,
            errors: [{ messageId: "missingExpect" }]
        },
        {
            code: `test.skip("foo", async t => {
                await t.click(button)
            })`,
            errors: [{ messageId: "missingExpect" }]
        },
        {
            code: `test.page("./foo")("foo", async t => {
                await t.click(button)
            })`,
            errors: [{ messageId: "missingExpect" }]
        },
        {
            code: `test.skip.page("./foo")("foo", async t => {
                await t.click(button)
            })`,
            errors: [{ messageId: "missingExpect" }]
        },
        {
            code: `test.before(async t => {
                await t.useRole(adminRole).wait(1000);
                await t.expect(Login).ok();
            })("foo", async t => {
                await t.click(button);
            })`,
            errors: [{ messageId: "missingExpect" }]
        },
        {
            code: `test("foo", async t => {
                await t
                    .useRole(adminRole)
                    .click(button)
                    .wait(1000)
            })`,
            errors: [{ messageId: "missingExpect" }]
        },
        {
            // Missing one expect across 2 tests
            code: `fixture("My Fixture")
                .page("https://example.com");

            test("test1", async t => {
                await t.useRole(adminRole).wait(500);
                await t.expect(foo).eql(bar);
            });

            test("test2", async t => {
                await t.click(button);
            });`,
            errors: [{ messageId: "missingExpect" }]
        }
    ]
});
