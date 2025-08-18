/**
 * @fileoverview Prevent tests from being disabled by `fixture.skip()` or `test.skip()` and forgotten.
 * @author Ben Monro
 */

import type { MemberExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import { createRule } from "../create-rule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    name: __filename,
    defaultOptions: [],
    meta: {
        messages: {
            "no-disabled-tests": "Skipped test case.",
            // TODO
            "no-disabled-test-suites": "Skipped test fixture."
        },
        type: "problem",
        docs: {
            description:
                "Prevent tests from being disabled by `fixture.skip()` or `test.skip()` and forgotten.",
            recommended: "warn"
        },
        schema: []
    },

    create(context) {
        // TODO: Detect fixture.skip vs test.skip
        return {
            "MemberExpression[property.name='skip']": (
                node: MemberExpression
            ) => {
                context.report({
                    node: node.property,
                    messageId: "no-disabled-tests"
                });
            }
        };
    }
});
