/**
 * @fileoverview Utility functions for deriving code location from ESLint's AST Tree
 * @author codejedi365
 */

import type {
    BaseNode,
    CallExpression,
    Identifier,
    MemberExpression
} from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/experimental-utils";
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
    if (!checkTypeForRecursion(startNode)) throw new Error();
    return deriveFnName(startNode);
}

export function deriveFunctionName(fnCall: CallExpression): string {
    const startNode =
        isMemberExpression(fnCall.callee) &&
        isIdentifier(fnCall.callee.property)
            ? fnCall.callee.property
            : fnCall.callee;

    try {
        return digForIdentifierName(startNode);
    } catch (e) {
        throw new Error("Could not derive function name from callee.");
    }
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
    try {
        return digForIdentifierName(fnCall.callee);
    } catch (e) {
        throw new Error("Could not derive object name from callee.");
    }
}

export function determineCodeLocation(
    node: CallExpression
): [FunctionName, ObjectName] {
    return [deriveFunctionName(node), deriveObjectName(node)];
}

export function isAncestorOf(
    ancestorNode: BaseNode,
    childNode: BaseNode
): boolean {
    function checkParent(child: BaseNode, parent: BaseNode): boolean {
        if (child === parent) {
            return true;
        }
        if (child.parent && child.parent.type !== AST_NODE_TYPES.Program) {
            return checkParent(child.parent, parent);
        }
        return false;
    }
    return checkParent(childNode, ancestorNode);
}
