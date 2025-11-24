import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { isReactComponent } from '../../utils/ast-helpers.js';

interface ComponentInfo {
	name: string;
	node: TSESTree.Node;
	isCompoundChild: boolean;
}

export const oneComponentPerFile = {
	meta: {
		type: 'problem' as const,
		docs: {
			description:
				'Enforce one component per file with explicit compound component patterns. This improves code organization, testability, and maintainability by keeping components focused and easy to locate.',
			category: 'Best Practices',
			recommended: 'error' as const,
			url: 'https://github.com/AliEl-Zayat/vertex-era-rules/blob/main/docs/rules/one-component-per-file.md',
		},
		schema: [],
		messages: {
			multipleComponents:
				'File contains {{count}} component definitions. Only one component per file is allowed. Found: {{componentNames}}. Consider splitting into separate files or using the compound component pattern (e.g., Component.SubComponent = SubComponent).',
		},
	},
	create(context: { report: (descriptor: { node: TSESTree.Node; messageId: string; data: Record<string, unknown> }) => void }) {
		const components: ComponentInfo[] = [];
		const compoundChildren = new Set<string>();

		return {
			AssignmentExpression(node: TSESTree.AssignmentExpression) {
				try {
					if (
						node.left.type === AST_NODE_TYPES.MemberExpression &&
						node.left.object.type === AST_NODE_TYPES.Identifier &&
						node.left.property.type === AST_NODE_TYPES.Identifier
					) {
						if (node.right.type === AST_NODE_TYPES.Identifier) {
							compoundChildren.add(node.right.name);
						}
					}
				} catch (error) {
					console.error('Error in one-component-per-file (AssignmentExpression):', error);
				}
			},

			FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
				try {
					if (isReactComponent(node)) {
						const name = node.id?.name || 'anonymous';
						components.push({
							name,
							node,
							isCompoundChild: false,
						});
					}
				} catch (error) {
					console.error('Error in one-component-per-file (FunctionDeclaration):', error);
				}
			},

			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				try {
					if (isReactComponent(node)) {
						const name =
							node.id.type === AST_NODE_TYPES.Identifier ? node.id.name : 'anonymous';
						components.push({
							name,
							node,
							isCompoundChild: false,
						});
					}
				} catch (error) {
					console.error('Error in one-component-per-file (VariableDeclarator):', error);
				}
			},

			ClassDeclaration(node: TSESTree.ClassDeclaration) {
				try {
					if (isReactComponent(node)) {
						const name = node.id?.name || 'anonymous';
						components.push({
							name,
							node,
							isCompoundChild: false,
						});
					}
				} catch (error) {
					console.error('Error in one-component-per-file (ClassDeclaration):', error);
				}
			},

			'Program:exit'() {
				try {
					components.forEach((component) => {
						if (compoundChildren.has(component.name)) {
							component.isCompoundChild = true;
						}
					});

					const nonCompoundComponents = components.filter((c) => !c.isCompoundChild);

					if (nonCompoundComponents.length > 1) {
						const componentNames = nonCompoundComponents.map((c) => c.name).join(', ');

						context.report({
							node: nonCompoundComponents[1].node,
							messageId: 'multipleComponents',
							data: {
								count: nonCompoundComponents.length,
								componentNames,
							},
						});
					}
				} catch (error) {
					console.error('Error in one-component-per-file (Program:exit):', error);
				}
			},
		};
	},
	defaultOptions: [] as const,
};

export default {
	'one-component-per-file': oneComponentPerFile,
};

