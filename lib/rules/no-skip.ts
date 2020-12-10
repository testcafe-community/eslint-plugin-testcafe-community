/**
 * @fileoverview Don't allow test.skip to be added to the repository
 * @author Ben Monro
 */
"use strict";

import { createRule } from "../create-rule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    name: __filename,
    defaultOptions:[],
    meta: {
        messages:{
            noSkip: 'Do not use the `.skip` hook.'
        },
        type: "suggestion",
        docs: {
            description: "Don't allow `test.skip` or `fixture.skip` to be added to the repository",
            category: "Best Practices",
            recommended: "warn",
        },
        schema: []
    },

    create: function (context) {
        return {
            "MemberExpression[property.name='skip']"(node: any) {
                context.report({
                    node: node.property,
                    messageId: 'noSkip'
                });
            },


        };
    }
});
