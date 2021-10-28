/**
 * @fileoverview Don't allow debug() to be committed to the repository.
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
            noDebugMessage: "Do not use the `.debug` action."
        },
        docs: {
            description:
                "Don't allow `t.debug()` to be committed to the repository. ",
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
                    messageId: "noDebugMessage"
                });
            }
        };
    }
});
