/**
 * @fileoverview Don't forget to have at least 1 expect() call in each test!
 * @author Ben Monro
 * @author codejedi365
 */
import type { CallExpression } from "@typescript-eslint/types/dist/ast-spec";
import { determineCodeLocation } from "../utils/locator";
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
