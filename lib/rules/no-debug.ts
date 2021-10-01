/**
 * @fileoverview Don't allow debug() to be committed to the repository.
 * @author Ben Monro
 */

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
            category: "Best Practices",
            recommended: "error"
        },
        schema: []
    },

    create(context) {
        return {
            "CallExpression[callee.property.name='debug']": function (
                node: any
            ) {
                context.report({
                    node: node.callee.property,
                    messageId: "noDebugMessage"
                });
            }
        };
    }
});
