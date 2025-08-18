/**
 * @fileoverview Utility for determining types for Typescript code
 * @author codejedi365
 */

import type {
    CallExpression,
    MemberExpression,
    Identifier,
    BaseNode,
    Literal
} from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/experimental-utils";

/**
 * Typescript type validation/conversion method
 * @param node variable to type check
 * @returns arg as type Literal
 */
export function isLiteral(node: BaseNode): node is Literal {
    // from ast-spec types Expression -> LiteralExpression -> Literal, all literals have attribute 'value'
    return node.type === AST_NODE_TYPES.Literal;
}

export function isMemberExpression(node: BaseNode): node is MemberExpression {
    return node.type === AST_NODE_TYPES.MemberExpression;
}

export function isIdentifier(node: BaseNode): node is Identifier {
    return node.type === AST_NODE_TYPES.Identifier;
}

export function isCallExpression(node: BaseNode): node is CallExpression {
    return node.type === AST_NODE_TYPES.CallExpression;
}
