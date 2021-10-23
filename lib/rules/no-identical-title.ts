/**
 * @fileoverview Don't allow multiple test functions to have the same name.
 * @author Ben Monro
 * @author codejedi365
 */

import type {
    CallExpression,
    CallExpressionArgument,
    Literal
} from "@typescript-eslint/types/dist/ast-spec";
import { determineCodeLocation } from "../utils/locator";
import { isLiteral } from "../utils/type-casting";
import { createRule } from "../create-rule";

const testFnAttributes = [
    // Derived List from TestFn class of testcafe@1.16.0/ts-defs/index.d.ts
    // - only extracted attributes which return the testFn object (this)
    //   which are possible modifiers to a test call before the test callback
    //   is defined
    "only",
    "skip",
    "disablePageCaching",
    "disablePageReloads"
];

function isRegExp(value: Literal["value"]): value is RegExp {
    return Object.getPrototypeOf(value) === RegExp.prototype;
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
    if (arg0value === null || isRegExp(arg0value)) {
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
        let isInsideTest = false;
        let hasRecordedTestName = false;

        const testTitles: { [key: string]: [CallExpressionArgument] } = {};

        const resetFlags = () => {
            hasRecordedTestName = false;
            isInsideTest = false;
        };

        const addTestTitle = (testTitle: string, node: CallExpression) => {
            if (testTitle in testTitles) {
                testTitles[testTitle].push(node.arguments[0]);
            } else {
                testTitles[testTitle] = [node.arguments[0]];
            }
        };

        const extractTestTitle = (node: CallExpression) => {
            let testTitle;
            try {
                testTitle = getValidTestName(node);
            } catch (e) {
                return;
            }
            isInsideTest = true;
            addTestTitle(testTitle, node);
            hasRecordedTestName = true;
        };

        const unknownFnCallENTER = (node: CallExpression) => {
            if (hasRecordedTestName) return; // Short circuit, already found

            let fnName;
            let objectName;
            try {
                [fnName, objectName] = determineCodeLocation(node);
            } catch (e) {
                // ABORT: Failed to evaluate rule effectively
                // since I cannot derive values to determine location in the code
                return;
            }
            // Determine if inside/chained to a test() function
            if (objectName !== "test") return;
            if (fnName === "test" || testFnAttributes.includes(fnName)) {
                extractTestTitle(node);
            }
        };

        const unknownFnCallEXIT = (node: CallExpression) => {
            if (!isInsideTest) return; // Short circuit

            let fnName;
            let objectName;
            try {
                [fnName, objectName] = determineCodeLocation(node);
            } catch (e) {
                // ABORT: Failed to evaluate rule effectively
                // since I cannot derive values to determine location in the code
                return;
            }
            if (objectName !== "test") return;
            if (fnName === "test" || testFnAttributes.includes(fnName)) {
                resetFlags();
            }
        };

        const evaluateForIdenticalTitles = () => {
            const duplicateNamedNodes = Object.values(testTitles).reduce(
                (
                    result: CallExpressionArgument[],
                    nodeList: CallExpressionArgument[]
                ): CallExpressionArgument[] => {
                    return nodeList.length > 1
                        ? result.concat(nodeList)
                        : result;
                },
                []
            );
            duplicateNamedNodes.forEach((testTitleNode) => {
                context.report({
                    node: testTitleNode,
                    messageId: "noIdenticalTitles"
                });
            });
        };

        const testFnCallExpression = "CallExpression[arguments.length=2]";

        return {
            // UNCOMMENT to Test & Debug
            // [`${testFnCallExpression}`]: (node: CallExpression) => {
            //     debugger;
            // },
            [`${testFnCallExpression}[callee.name=test]`]: (
                node: CallExpression
            ) => {
                extractTestTitle(node);
            },
            [`${testFnCallExpression}[callee.name=test]:exit`]: () => {
                resetFlags();
            },
            [`${testFnCallExpression}[callee.type=CallExpression]`]:
                unknownFnCallENTER,
            [`${testFnCallExpression}[callee.type=CallExpression]:exit`]:
                unknownFnCallEXIT,
            [`${testFnCallExpression}[callee.type=MemberExpression]`]:
                unknownFnCallENTER,
            [`${testFnCallExpression}[callee.type=MemberExpression]:exit`]:
                unknownFnCallEXIT,
            "Program:exit": () => {
                evaluateForIdenticalTitles();
            }
        };
    }
});
