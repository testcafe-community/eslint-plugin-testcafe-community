import { CallExpression } from "typescript";
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
            noIdenticalTitles: "Don't use identical titles for your tests"
        },
        docs: {
            description: "Don't use identical titles for your tests",
            category: "Best Practices",
            recommended: "error"
        },
        schema: []
    },
    
    create(context) {
        const testTitles: {[key: string]:[any]} = {};
        return {
            ["CallExpression[callee.name=test]"](node:any) {
                const testTitle = node.arguments[0].value as string;
                if(testTitle in testTitles) {
                    testTitles[testTitle].push(node)
                } else {
                    testTitles[testTitle] = [node];
                }
                // const title = testTitles[testTitle];
                // testTitles[testTitle] = [title, node]

            },
            ["Program:exit"]() {
                Object.keys(testTitles).forEach(testTitle => {           
                    if(testTitles[testTitle].length > 1) {
                      for(const testTitleNode of testTitles[testTitle]) {
                        context.report({node: testTitleNode, messageId: "noIdenticalTitles"})

                      }
                    }
                })
            }
        }
    }
});
