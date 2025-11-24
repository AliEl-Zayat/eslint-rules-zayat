import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import {
  hasIntentionalIgnoreComment,
  isEffectivelyEmpty,
} from "../../utils/ast-helpers.js";
import { createRule } from "../../utils/create-rule.js";

function checkIfParamUsed(
  block: TSESTree.BlockStatement,
  paramName: string
): boolean {
  let isUsed = false;

  function traverse(node: TSESTree.Node): void {
    if (!node || isUsed) return;

    if (node.type === AST_NODE_TYPES.Identifier && node.name === paramName) {
      isUsed = true;
      return;
    }

    for (const key in node) {
      if (key === "parent" || key === "range" || key === "loc") continue;

      const value = (node as unknown as Record<string, unknown>)[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === "object" && "type" in item) {
              traverse(item as TSESTree.Node);
            }
          }
        } else if ("type" in value) {
          traverse(value as TSESTree.Node);
        }
      }
    }
  }

  traverse(block);
  return isUsed;
}

export const noEmptyCatch = createRule({
  name: "no-empty-catch",
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent empty catch blocks in try-catch statements. Empty catch blocks can hide errors and make debugging difficult. Either handle the error appropriately or explicitly document why it is being ignored.",
    },
    fixable: "code",
    schema: [],
    messages: {
      emptyCatch:
        "Empty catch block detected. Either handle the error (e.g., log it, show user feedback) or add an explicit comment: // intentionally ignored",
      unusedParam:
        'Catch parameter "{{paramName}}" is declared but never used. Either use the error parameter to handle the error, or add a comment explaining why it is intentionally ignored.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      CatchClause(node: TSESTree.CatchClause) {
        try {
          const isEmpty = isEffectivelyEmpty(node);
          const isIntentionallyIgnored = hasIntentionalIgnoreComment(
            node,
            sourceCode
          );

          if (isEmpty) {
            if (!isIntentionallyIgnored) {
              context.report({
                node,
                messageId: "emptyCatch",
                fix(fixer) {
                  const catchKeyword = sourceCode.getFirstToken(node);
                  if (catchKeyword) {
                    return fixer.insertTextAfter(
                      catchKeyword,
                      " // intentionally ignored"
                    );
                  }
                  return null;
                },
              });
            }
          }

          if (!isEmpty && !isIntentionallyIgnored && node.param) {
            const param = node.param;

            if (param.type === AST_NODE_TYPES.Identifier) {
              const paramName = param.name;
              const isParamUsed = checkIfParamUsed(node.body, paramName);

              if (!isParamUsed) {
                context.report({
                  node: param,
                  messageId: "unusedParam",
                  data: {
                    paramName,
                  },
                });
              }
            }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error in no-empty-catch:", error);
        }
      },
    };
  },
});

export default {
  "no-empty-catch": noEmptyCatch,
};
