/**
 * @fileoverview Don't forget to have at least 1 expect() call in each test!
 * @author Ben Monro
 * @author codejedi365
 */
import type {
    CallExpression,
    BaseNode
} from "@typescript-eslint/types/dist/ast-spec";
import { determineCodeLocation, isAncestorOf } from "../utils/locator";
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
        let currentTestNode: CallExpression | null = null;
        let testFnImplementationNode: BaseNode | null = null;

        const resetFlags = () => {
            hasExpect = false;
            isInsideTest = false;
            currentTestNode = null;
            testFnImplementationNode = null;
        };

        const activateExpectTracking = (node: CallExpression) => {
            isInsideTest = true;
            currentTestNode = node;
            [, testFnImplementationNode] = currentTestNode.arguments;
        };

        const isInsideTestFnImplementation = (node: CallExpression) => {
            return testFnImplementationNode
                ? isAncestorOf(testFnImplementationNode, node)
                : false;
        };

        const validateExpectWasFound = (node: CallExpression) => {
            if (!hasExpect) {
                context.report({ node, messageId: "missingExpect" });
            }
            resetFlags();
        };

        const unknownFnCallENTER = (node: CallExpression) => {
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

            // Determine if inside/chained to a test() function
            if (objectName !== "test") return;
            if (fnName === "test" || testFnAttributes.includes(fnName)) {
                activateExpectTracking(node);
            }
        };

        const unknownFnCallEXIT = (node: CallExpression) => {
            if (isInsideTest && node === currentTestNode) {
                validateExpectWasFound(node);
            }
        };

        const testFnCallExpression = "CallExpression[arguments.length=2]";
        const expectFnCallExpression =
            "CallExpression[arguments.length=1][callee.property.name=expect]";

        return {
            // UNCOMMENT to Debug step-by-step
            // ---------------------------------
            // "CallExpression": (node: CallExpression) => {
            //     debugger;
            // },
            // "CallExpression:exit": (node: CallExpression) => {
            //     debugger;
            // },
            // ---------------------------------
            // test("name", () => {}), ENTER
            [`${testFnCallExpression}[callee.name=test]`]:
                activateExpectTracking,
            // test("name", () => {}), EXIT
            [`${testFnCallExpression}[callee.name=test]:exit`]:
                unknownFnCallEXIT,
            [`${testFnCallExpression}[callee.type=CallExpression]`]:
                unknownFnCallENTER,
            [`${testFnCallExpression}[callee.type=CallExpression]:exit`]:
                unknownFnCallEXIT,
            [`${testFnCallExpression}[callee.type=MemberExpression]`]:
                unknownFnCallENTER,
            [`${testFnCallExpression}[callee.type=MemberExpression]:exit`]:
                unknownFnCallEXIT,
            // expect(actual), ENTER
            [expectFnCallExpression]: (node: CallExpression) => {
                if (!isInsideTest || hasExpect) return; // Short circuit
                if (isInsideTestFnImplementation(node)) {
                    hasExpect = true;
                }
            }
        };
    }
});
