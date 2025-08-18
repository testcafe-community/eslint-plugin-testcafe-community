import type { CallExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/experimental-utils";
import {
    determineCodeLocation,
    deriveFunctionName,
    deriveObjectName
} from "../../../lib/utils/locator";

type LocTuple = [string, string];

describe("Locator.ts", () => {
    describe("determineCodeLocation()", () => {
        it("returns tuple with the parent [function, object]", () => {
            const node: CallExpression = {
                arguments: [],
                callee: {
                    name: "test",
                    loc: {
                        start: { line: 1, column: 2 },
                        end: { line: 1, column: 5 }
                    },
                    range: [2, 5],
                    type: AST_NODE_TYPES.Identifier
                },
                loc: {
                    start: { line: 1, column: 2 },
                    end: { line: 1, column: 5 }
                },
                optional: false,
                range: [2, 5],
                type: AST_NODE_TYPES.CallExpression
            };
            let result: Partial<LocTuple> = [];
            expect(function caller() {
                result = determineCodeLocation(node);
            }).not.toThrow();
            expect(result).toEqual<LocTuple>(["test", "test"]);
        });
    });

    describe("deriveFunctionName()", () => {
        // ""
        it("throws Error when receives underivable node", () => {
            const node: CallExpression = {
                arguments: [],
                callee: {
                    meta: {
                        name: "fake",
                        loc: {
                            start: { line: 1, column: 2 },
                            end: { line: 1, column: 5 }
                        },
                        range: [0, 0],
                        type: AST_NODE_TYPES.Identifier
                    },
                    property: {
                        name: "fakeProperty",
                        loc: {
                            start: { line: 1, column: 2 },
                            end: { line: 1, column: 5 }
                        },
                        range: [0, 0],
                        type: AST_NODE_TYPES.Identifier
                    },
                    loc: {
                        start: { line: 1, column: 2 },
                        end: { line: 1, column: 5 }
                    },
                    range: [2, 5],
                    type: AST_NODE_TYPES.MetaProperty
                },
                loc: {
                    start: { line: 1, column: 2 },
                    end: { line: 1, column: 5 }
                },
                optional: false,
                range: [2, 5],
                type: AST_NODE_TYPES.CallExpression
            };
            expect(() => {
                deriveFunctionName(node);
            }).toThrow("Could not derive function name from callee.");
        });
    });

    describe("deriveObjectName()", () => {
        // ""
        it("throws Error when receives underivable node", () => {
            const node: CallExpression = {
                arguments: [],
                callee: {
                    computed: false,
                    property: {
                        name: "fakeProperty",
                        loc: {
                            start: { line: 1, column: 2 },
                            end: { line: 1, column: 5 }
                        },
                        range: [2, 5],
                        type: AST_NODE_TYPES.Identifier
                    },
                    loc: {
                        start: { line: 1, column: 2 },
                        end: { line: 1, column: 5 }
                    },
                    range: [2, 5],
                    optional: false,
                    object: {
                        meta: {
                            name: "fake",
                            loc: {
                                start: { line: 1, column: 2 },
                                end: { line: 1, column: 5 }
                            },
                            range: [0, 0],
                            type: AST_NODE_TYPES.Identifier
                        },
                        property: {
                            name: "fakeProperty",
                            loc: {
                                start: { line: 1, column: 2 },
                                end: { line: 1, column: 5 }
                            },
                            range: [0, 0],
                            type: AST_NODE_TYPES.Identifier
                        },
                        loc: {
                            start: { line: 1, column: 2 },
                            end: { line: 1, column: 5 }
                        },
                        range: [2, 5],
                        type: AST_NODE_TYPES.MetaProperty
                    },
                    type: AST_NODE_TYPES.MemberExpression
                },
                loc: {
                    start: { line: 1, column: 2 },
                    end: { line: 1, column: 5 }
                },
                optional: false,
                range: [2, 5],
                type: AST_NODE_TYPES.CallExpression
            };
            expect(() => {
                deriveObjectName(node);
            }).toThrow("Could not derive object name from callee.");
        });
    });
});
