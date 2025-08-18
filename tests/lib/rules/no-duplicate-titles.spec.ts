/**
 * @fileoverview Don't allow duplicate titles for tests.
 * @author Ben Monro
 * @author codejedi365
 */

import type { CallExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import {
    TSESLint,
    AST_NODE_TYPES
} from "@typescript-eslint/experimental-utils";
import resolveFrom from "resolve-from";
import rule from "../../../lib/rules/no-duplicate-titles";
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
    ruleTester.run("no-duplicate-titles", rule, {
        valid: [
            `
            test("my test", async t => {});
            test("my other test", async t => {});
            `,
            `
            test.page("./foo")("my test", async t => {});
            test.page("./foo")("my other test", async t => {});
            `,
            `
            test("my test", async t => {});
            test.page("./foo")("my other test", async t => {});
            `,
            `
            test("my test", async t => {});
            test.skip("my other test", async t => {});
            `,
            `
            test("my test", async t => {});
            test.only.page("./foo")("my other test", async t => {});
            `,
            `
            test("my test", async t => {});
            test.before(async t => {
                await t.wait(1000);
            })("my other test", async t => {
                await t.click().expect(true).ok();
            });
            `,
            `
            test.before(async t => {
                await t.wait(1000);
            })("my test", async t => {
                await t.click().expect(true).ok();
            });

            test.before(async t => {
                await t.wait(1000);
            })("my other test", async t => {
                await t.click().expect(true).ok();
            });
            `,
            `
            fixture("My App").meta("ID", "F01").page("http://example.com")

            test("My App", async () => {
                await t.expect(true).eql(true, "error msg");
            });
            test("My App click test", async () => {
                await t.click().expect(true).ok();
            });
            `,
            // Futuristic TestCafe || unexpected test chain => ignore as valid
            `test.futureModifier("test", async t => {
                await t.expect(true).ok();
            });`,
            // ignore undeterminable code (don't throw an error, not this rule's focus)
            `test(/^regex_name/, async t => {});`,
            `test(null, async t => {})`,
            `test(getTestName("F-0001"), async t => {});`
        ],
        invalid: [
            {
                code: `
                    test("my test", async t => {});
                    test("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            },
            {
                code: `
                    test.page("./foo")("my test", async t => {});
                    test.page("./foo")("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            },
            {
                code: `
                    test("my test", async t => {});
                    test.page("./foo")("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            },
            {
                code: `
                    test("my test", async t => {});
                    test.skip("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            },
            {
                code: `
                    test("my test", async t => {});
                    test.only.page("./foo")("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            },
            {
                code: `
                    test("my test", async t => {});
                    test.before(async t => {
                        await t.wait(1000);
                    })("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            },
            {
                code: `
                    test.before(async t => {
                        await t.wait(1000);
                    })("my test", async t => {});

                    test.before(async t => {
                        await t.wait(1000);
                    })("my test", async t => {});
                `,
                errors: [
                    { messageId: "no-duplicate-titles" },
                    { messageId: "no-duplicate-titles" }
                ]
            }
        ]
    });
});

describe("Error Handling", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const ruleFns = rule.create({
        id: "no-duplicate-titles-error",
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
    it("Ignores an undeterminable code location internal error of CallExpression:exit", () => {
        determineCodeLocationMock
            .mockImplementationOnce(() => {
                return ["test", "test"];
            })
            .mockImplementationOnce(() => {
                throw new Error("FATAL: Unable to determine code location");
            });
        // simulate enter of test();
        ruleFns[
            "CallExpression[arguments.length=2][callee.type=CallExpression]"
        ](fakeNode);
        // Test proper exit of test() that fails;
        expect(() => {
            ruleFns[
                "CallExpression[arguments.length=2][callee.type=CallExpression]:exit"
            ](fakeNode);
        }).not.toThrow();
    });
});
