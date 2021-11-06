/**
 * @fileoverview Prevent permanent use of `t.debug()`.
 * @author Ben Monro
 */
import type {
    CallExpression,
    MemberExpression
} from "@typescript-eslint/types/dist/ast-spec";
import { createRule } from "../create-rule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    name: __filename,
    defaultOptions: [],
    meta: {
        type: "problem",
        messages: {
            "no-debug": "Unexpected `t.debug()` expression."
        },
        docs: {
            description:
                "`t.debug()` should not exist permanently, use only for debugging of a test failure.",
            recommended: "error"
        },
        schema: []
    },

    create(context) {
        return {
            "CallExpression[callee.property.name='debug']": (
                node: CallExpression & { callee: MemberExpression }
            ) => {
                context.report({
                    node: node.callee.property,
                    messageId: "no-debug"
                });
            }
        };
    }
});
