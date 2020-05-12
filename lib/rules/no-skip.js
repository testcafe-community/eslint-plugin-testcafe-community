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
            description: "Don't allow `test.skip` or `fixture.skip` to be added to the repository",
            category: "Mistake Prevention",
            recommended: true
        },
        fixable: null,
        schema: []
    },

    create: function (context) {

        return {

            "MemberExpression[property.name='skip']"(node) {
                context.report({
                    node: node.property,
                    message: 'Do not use the `.skip` hook.'
                });
            },


        };
    }
};
