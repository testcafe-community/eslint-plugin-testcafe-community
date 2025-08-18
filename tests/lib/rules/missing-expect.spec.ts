/**
 * @fileoverview Don't forget to have at least 1 `t.expect()` in every test!
 * @author Ben Monro
 * @author codejedi365
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import type { CallExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import {
    TSESLint,
    AST_NODE_TYPES
} from "@typescript-eslint/experimental-utils";
import resolveFrom from "resolve-from";
import rule from "../../../lib/rules/missing-expect";
import { determineCodeLocation } from "../../../lib/utils/locator";

jest.mock("../../../lib/utils/locator", () => {
    const actual = jest.requireActual<
        typeof import("../../../lib/utils/locator")
    >("../../../lib/utils/locator");
    return {
        ...actual,
        determineCodeLocation: jest.fn(actual.determineCodeLocation)
    };
});

const determineCodeLocationMock = determineCodeLocation as jest.MockedFunction<
    typeof determineCodeLocation
>;

const ruleTester = new TSESLint.RuleTester({
    parser: resolveFrom(require.resolve("eslint"), "espree"),
    parserOptions: { ecmaVersion: 8 }
});

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
describe("ESLint Code Snippets", () => {
    ruleTester.run("missing-expect", rule, {
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
                await t.click(button);
                await t.expect(foo).eql("bar", "failed to equal bar");
            })`,
            // Multiple expects
            `test("foo", async t => {
                await t.click(button)
                await t.expect(true).ok()
                await t.expect(foo).eql("bar", "failed to equal bar");
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
            });`,
            // Futuristic TestCafe || unexpected test chain => ignore as valid
            `test.futureModifier("test", async t => {
                await t.expect(true).ok();
            });`
        ],
        invalid: [
            {
                code: `test("foo", async t => {
                    await t.click(button)
                })`,
                errors: [{ messageId: "missing-expect" }]
            },
            {
                code: `test.skip("foo", async t => {
                    await t.click(button)
                })`,
                errors: [{ messageId: "missing-expect" }]
            },
            {
                code: `test.page("./foo")("foo", async t => {
                    await t.click(button)
                })`,
                errors: [{ messageId: "missing-expect" }]
            },
            {
                code: `test.skip.page("./foo")("foo", async t => {
                    await t.click(button)
                })`,
                errors: [{ messageId: "missing-expect" }]
            },
            {
                code: `test.before(async t => {
                    await t.useRole(adminRole).wait(1000);
                    await t.expect(Login).ok();
                })("foo", async t => {
                    await t.click(button);
                })`,
                errors: [{ messageId: "missing-expect" }]
            },
            {
                code: `test("foo", async t => {
                    await t
                        .useRole(adminRole)
                        .click(button)
                        .wait(1000)
                })`,
                errors: [{ messageId: "missing-expect" }]
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
                errors: [{ messageId: "missing-expect" }]
            }
        ]
    });
});

describe("Error Handling", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const ruleFns = rule.create({
        id: "missing-expect-error",
        options: [],
        parserOptions: {},
        parserPath: resolveFrom(require.resolve("eslint"), "espree"),
        settings: {},
        getAncestors: jest.fn(),
        getDeclaredVariables: jest.fn(),
        getFilename: jest.fn(),
        getScope: jest.fn(),
        getSourceCode: jest.fn(),
        markVariableAsUsed: jest.fn(),
        report: jest.fn()
    });
    const fakeNode: CallExpression = {
        arguments: [
            {
                value: "Valid Test Name",
                raw: "Valid Test Name",
                range: [5, 20],
                loc: {
                    start: { line: 1, column: 5 },
                    end: { line: 1, column: 20 }
                },
                type: AST_NODE_TYPES.Literal
            }
        ],
        callee: {
            name: "fakeNode",
            loc: {
                start: { line: 1, column: 2 },
                end: { line: 1, column: 5 }
            },
            range: [2, 5],
            type: AST_NODE_TYPES.Identifier
        },
        type: AST_NODE_TYPES.CallExpression,
        loc: {
            start: { line: 1, column: 2 },
            end: { line: 1, column: 5 }
        },
        optional: false,
        range: [2, 5]
    };

    it("Ignores an undeterminable code location internal error of CallExpression", () => {
        determineCodeLocationMock.mockImplementation(() => {
            throw new Error("FATAL: Unable to determine code location");
        });
        expect(() => {
            ruleFns[
                "CallExpression[arguments.length=2][callee.type=CallExpression]"
            ](fakeNode);
        }).not.toThrow();
    });
});
