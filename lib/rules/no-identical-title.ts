import {
    AST_NODE_TYPES,
    CallExpression,
    CallExpressionArgument,
    Literal
} from "@typescript-eslint/types/dist/ast-spec";
import { createRule } from "../create-rule";

/**
 * Typescript type validation/conversion method
 * @param arg variable to type check
 * @returns arg as type Literal
 */
function isLiteral(arg: CallExpressionArgument): arg is Literal {
    // from ast-spec types Expression -> LiteralExpression -> Literal, all literals have attribute 'value'
    return arg.type === AST_NODE_TYPES.Literal;
}

/**
 * Type safe method to extract possible test name of type string
 * Prevents user from providing invalid arg0 to `test()` which can cause eslint to crash
 * @param node Eslint evaluated ASTTree Node based on CallExpression[callee.name=test]
 * @returns string of possible test name
 */
function getValidTestName(node: CallExpression): string {
    if (!isLiteral(node.arguments[0])) {
        throw new Error("Not a Literal expression.");
    }
    const arg0value: Literal["value"] = node.arguments[0].value;
    if (
        arg0value === null ||
        Object.getPrototypeOf(arg0value) === RegExp.prototype
    ) {
        throw new Error(
            "Unusable Literal value for test names (NullLiteral & RegExpLiteral)"
        );
    }
    return arg0value.toString();
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
        const testTitles: { [key: string]: [CallExpression] } = {};
        return {
            "CallExpression[callee.name=test]": (node: CallExpression) => {
                let testTitle;
                try {
                    testTitle = getValidTestName(node);
                } catch (e) {
                    return;
                }
                if (testTitle in testTitles) {
                    testTitles[testTitle].push(node);
                } else {
                    testTitles[testTitle] = [node];
                }
                // const title = testTitles[testTitle];
                // testTitles[testTitle] = [title, node]
            },
            "Program:exit": () => {
                Object.values(testTitles).forEach((nodeList) => {
                    if (nodeList.length > 1) {
                        nodeList.forEach((testTitleNode) => {
                            context.report({
                                node: testTitleNode,
                                messageId: "noIdenticalTitles"
                            });
                        });
                    }
                });
            }
        };
    }
});
