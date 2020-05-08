/**
 * @fileoverview Don't allow test.skip to be added to the repository
 * @author Ben Monro
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Don't allow test.skip to be added to the repository",
            category: "Mistake Prevention",
            recommended: true
        },
        fixable: null,
        schema: []
    },

    create: function (context) {

        return {

            "MemberExpression[object.name=/fixture|test/][property.name='skip']"(node) {
                context.report({
                    node: node.property,
                    message: 'Do not use skip'
                });
            },


        };
    }
};
