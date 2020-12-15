/**
 * @fileoverview Don't allow debug() to be committed to the repository. 
 * @author Ben Monro
 */
"use strict";

import { createRule } from "../create-rule";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule({
    name: __filename,
    defaultOptions: [],
    meta: {
        type:"problem",
        messages: {
            missingExpect: 'Please ensure your test has at least one expect'
        },
        docs: {
            description: "Ensure tests have at least one expect",
            category: "Best Practices",
            recommended: "error"
        },
        schema: []
    },
    create: function(context) {

  let hasExpect = false;
  let isInsideTest = false;
        return {
            "CallExpression"(node: any) {
                const name = node.callee.name || node.callee.property?.name;
                const objectName = node.callee.object?.name || node.callee.callee?.object?.object?.name || node.parent.callee?.callee?.object?.name;
                if (name === "test" || objectName === "test") {
                  isInsideTest = true;
                }
                if (isInsideTest && name === "expect") {
                  hasExpect = true;
                }
              },
          
              "CallExpression:exit"(node: any) {
                const name = node.callee.name || node.callee.property?.name;
                
                const objectName = node.callee.object?.name || node.callee.callee?.object?.object?.name || node.parent.callee?.callee.object.name;
                if (name === "test" || objectName === "test") {
                  if (!hasExpect) {
                    context.report({ node, messageId: "missingExpect" });
                  }
                  hasExpect = false;
                  isInsideTest = false;
                }
              }
        }
    }
}
); 
