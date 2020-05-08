/**
 * @fileoverview Don't allow debug() to be committed to the repository. 
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Don't allow debug() to be committed to the repository. ",
            category: "Mistake Prevention",
            recommended: true
        },
        fixable: null,
        schema: []
    },

    create: function (context) {
        return {
            "CallExpression[callee.property.name='debug']"(node) {
                context.report({
                    node: node.callee.property,
                    message: 'Do not use debug'
                });
            }
        };
    }
};
