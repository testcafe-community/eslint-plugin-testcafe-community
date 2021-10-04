/**
 * @fileoverview Don't allow debug() to be committed to the repository.
 * @author Ben Monro
 */
import type {
    CallExpression,
    LeftHandSideExpression,
    MemberExpression,
    MetaProperty
} from "@typescript-eslint/types/dist/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/experimental-utils";
import { createRule } from "../create-rule";

function hasPropertyAttr(
    callee: LeftHandSideExpression
): callee is MemberExpression | MetaProperty {
    return (
        callee.type === AST_NODE_TYPES.MemberExpression ||
        callee.type === AST_NODE_TYPES.MetaProperty
    );
}

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
            category: "Best Practices",
            recommended: "error"
        },
        schema: []
    },

    create(context) {
        return {
            "CallExpression[callee.property.name='debug']": (
                node: CallExpression
            ) => {
                if (hasPropertyAttr(node.callee)) {
                    context.report({
                        node: node.callee.property,
                        messageId: "noDebugMessage"
                    });
                }
            }
        };
    }
});
