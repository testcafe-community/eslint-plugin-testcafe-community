/**
 * @fileoverview Utility functions for deriving code location from ESLint's AST Tree
 * @author codejedi365
 */

import type {
    CallExpression,
    MemberExpression,
    Identifier,
    BaseNode
} from "@typescript-eslint/types/dist/ast-spec";
import {
    isCallExpression,
    isIdentifier,
    isMemberExpression
} from "./type-casting";

export type FunctionName = string;
export type ObjectName = string;

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

export function deriveFunctionName(fnCall: CallExpression): string {
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
export function deriveObjectName(fnCall: CallExpression): string {
    return digForIdentifierName(fnCall.callee);
}

export function determineCodeLocation(
    node: CallExpression
): [FunctionName, ObjectName] {
    return [deriveFunctionName(node), deriveObjectName(node)];
}
