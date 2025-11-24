import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { matchesServicePath } from '../../utils/ast-helpers.js';

export const noResponseDataReturn = {
	meta: {
		type: 'problem' as const,
		docs: {
			description:
				'Prevent direct response.data returns in service layer files to ensure proper response transformation. Service layers should transform, validate, or normalize API responses before returning them to ensure type safety and consistent data structures.',
			category: 'Best Practices',
			recommended: 'error' as const,
			url: 'https://github.com/AliEl-Zayat/vertex-era-rules/blob/main/docs/rules/no-response-data-return.md',
		},
		schema: [],
		messages: {
			directResponseDataReturn:
				"Direct return of response.data bypasses the service layer's responsibility to transform and validate data. Add transformation logic (e.g., map to domain models, validate types, normalize structure) before returning.",
		},
	},
	create(context: {
		filename: string;
		report: (descriptor: { node: TSESTree.Node; messageId: string }) => void;
	}) {
		const filename = context.filename;
		const isServiceFile = matchesServicePath(filename);

		if (!isServiceFile) {
			return {};
		}

		function isResponseDataAccess(node: TSESTree.MemberExpression): boolean {
			try {
				if (
					node.property.type !== AST_NODE_TYPES.Identifier ||
					node.property.name !== 'data'
				) {
					return false;
				}

				let current: TSESTree.Node = node.object;

				while (current.type === AST_NODE_TYPES.MemberExpression) {
					current = current.object;
				}

				if (current.type === AST_NODE_TYPES.Identifier) {
					const name = current.name.toLowerCase();
					return (
						name.includes('response') ||
						name.includes('res') ||
						name === 'r' ||
						name.includes('result')
					);
				}

				return false;
			} catch (error) {
				console.error('Error in isResponseDataAccess:', error);
				return false;
			}
		}

		function isDirectResponseDataReturn(returnNode: TSESTree.ReturnStatement): boolean {
			try {
				if (!returnNode.argument) return false;

				if (returnNode.argument.type === AST_NODE_TYPES.MemberExpression) {
					return isResponseDataAccess(returnNode.argument);
				}

				if (returnNode.argument.type === AST_NODE_TYPES.ChainExpression) {
					const expr = returnNode.argument.expression;
					if (expr.type === AST_NODE_TYPES.MemberExpression) {
						return isResponseDataAccess(expr);
					}
				}

				return false;
			} catch (error) {
				console.error('Error in isDirectResponseDataReturn:', error);
				return false;
			}
		}

		return {
			ReturnStatement(node: TSESTree.ReturnStatement) {
				try {
					if (isDirectResponseDataReturn(node)) {
						context.report({
							node,
							messageId: 'directResponseDataReturn',
						});
					}
				} catch (error) {
					console.error('Error in no-response-data-return (ReturnStatement):', error);
				}
			},
		};
	},
	defaultOptions: [] as const,
};

export default {
	'no-response-data-return': noResponseDataReturn,
};

