/**
 * @fileoverview Don't allow a single test or fixture to take all the focus.
 * @author Ben Monro
 */

import type { MemberExpression } from "@typescript-eslint/types/dist/generated/ast-spec";
import { createRule } from "../create-rule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    defaultOptions: [],
    name: __filename,
    meta: {
        messages: {
            "no-focused-tests": "Unexpected focused test.",
            // TODO
            "no-focused-fixtures": "Unexpected focused fixture."
        },
        type: "problem",
        docs: {
            description:
                "Don't allow a single test or fixture to take all the focus.",
            recommended: "error"
        },
        schema: []
    },

    create(context) {
        return {
            "MemberExpression[property.name='only']": (
                node: MemberExpression
            ) => {
                // TODO: Detect fixture vs. a test with the `.only()`
                context.report({
                    node: node.property,
                    messageId: "no-focused-tests"
                });
            }
        };
    }
});
