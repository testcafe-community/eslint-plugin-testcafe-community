/**
 * @fileoverview Don't allow test.only to be added to the repository
 * @author Ben Monro
 */

import type { MemberExpression } from "@typescript-eslint/types/dist/ast-spec";
import { createRule } from "../create-rule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    defaultOptions: [],
    name: __filename,
    meta: {
        messages: {
            noOnly: "Do not use the `.only` hook."
        },
        type: "problem",
        docs: {
            description:
                "Don't allow `test.only` to be added to the repository",
            category: "Best Practices",
            recommended: "error"
        },
        schema: []
    },

    create(context) {
        return {
            "MemberExpression[property.name='only']": (
                node: MemberExpression
            ) => {
                context.report({
                    node: node.property,
                    messageId: "noOnly"
                });
            }
        };
    }
});
