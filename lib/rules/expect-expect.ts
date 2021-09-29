/**
 * @fileoverview Don't allow debug() to be committed to the repository.
 * @author Ben Monro
 * @author codejedi365
 */
import {
    CallExpression,
    MemberExpression,
    Identifier,
    AST_NODE_TYPES,
    BaseNode
} from "@typescript-eslint/types/dist/ast-spec";
import { createRule } from "../create-rule";

type FunctionName = string;
type ObjectName = string;

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

function isMemberExpression(node: BaseNode): node is MemberExpression {
    return node.type === AST_NODE_TYPES.MemberExpression;
}

function isIdentifier(node: BaseNode): node is Identifier {
    return node.type === AST_NODE_TYPES.Identifier;
}

function isCallExpression(node: BaseNode): node is CallExpression {
    return node.type === AST_NODE_TYPES.CallExpression;
}

function digForIdentifierName(startNode: BaseNode): string {
    function checkTypeForRecursion(
        node: BaseNode
    ): node is CallExpression | MemberExpression | Identifier {
        return (
            isIdentifier(node) ||
            isMemberExpression(node) ||
            isCallExpression(node)
        );
    }
    function deriveFnName(
        node: CallExpression | MemberExpression | Identifier
    ): string {
        let nextNode: BaseNode = node;

        if (isCallExpression(node)) {
            nextNode = node.callee;
        } else if (isMemberExpression(node)) {
            nextNode = node.object;
        } else if (isIdentifier(node)) {
            return node.name;
        }

        if (!checkTypeForRecursion(nextNode)) throw new Error();
        return deriveFnName(nextNode);
    }

    // Start Point
    try {
        if (!checkTypeForRecursion(startNode)) throw new Error();
        return deriveFnName(startNode);
    } catch (e) {
        throw new Error("Could not derive function name from callee.");
    }
}

function deriveFunctionName(fnCall: CallExpression): string {
    const startNode =
        isMemberExpression(fnCall.callee) &&
        isIdentifier(fnCall.callee.property)
            ? fnCall.callee.property
            : fnCall.callee;

    return digForIdentifierName(startNode);
}

/**
 * Must detect symbol names in the following syntatical situations
 * 1. stand-alone function call (identifier only)
 * 2. object class method call (MemberExpression)
 * 3. n+ deep object attributes (Recursive MemberExpressions)
 * 4. when expression Is on a method chain (Recursive CallExpressions)
 * @param fnCall
 * @returns top level symbol for name of object
 */
function deriveObjectName(fnCall: CallExpression): string {
    return digForIdentifierName(fnCall.callee);
}

function determineCodeLocation(
    node: CallExpression
): [FunctionName, ObjectName] {
    return [deriveFunctionName(node), deriveObjectName(node)];
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
            missingExpect: "Please ensure your test has at least one expect"
        },
        docs: {
            description: "Ensure tests have at least one expect",
            category: "Best Practices",
            recommended: "error"
        },
        schema: []
    },
    create(context) {
        let hasExpect = false;
        let isInsideTest = false;
        let ignoreExpects = false;
        return {
            "CallExpression": (node: CallExpression) => {
                if (isInsideTest && hasExpect) return; // Short circuit, already found

                let fnName;
                let objectName;
                try {
                    [fnName, objectName] = determineCodeLocation(node);
                } catch (e) {
                    // ABORT: Failed to evaluate rule effectively
                    // since I cannot derive values to determine location in the code
                    return;
                }

                if (isInsideTest) {
                    if (ignoreExpects) return;
                    if (fnName === "expect") {
                        hasExpect = true;
                        return;
                    }
                    if (objectName === "test") {
                        // only happens in chained methods with internal callbacks
                        // like test.before(() => {})("my test", async () => {})
                        // prevents any registering of an expect in the before() callback
                        ignoreExpects = true;
                    }
                    return;
                }
                // Determine if inside/chained to a test() function
                if (objectName !== "test") return;
                if (fnName === "test" || testFnAttributes.includes(fnName)) {
                    isInsideTest = true;
                }
            },

            "CallExpression:exit": (node: CallExpression) => {
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
                    if (!hasExpect) {
                        context.report({ node, messageId: "missingExpect" });
                    }
                    hasExpect = false;
                    isInsideTest = false;
                }
                ignoreExpects = false;
            }
        };
    }
});
