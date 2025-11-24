import type { TSESTree } from '@typescript-eslint/utils';
import {
	getAttributeName,
	getPropValue,
	isInlineFunction,
	isInlineObject,
	validateJSXAttributeStructure,
} from '../../utils/jsx-helpers.js';

export const noInlineObjects = {
	meta: {
		type: 'problem' as const,
		docs: {
			description:
				'Prevent inline object literals in JSX props. Inline objects create new references on every render, causing unnecessary re-renders of child components. Extract objects to variables or useMemo for better performance.',
			category: 'Best Practices',
			recommended: 'error' as const,
			url: 'https://github.com/AliEl-Zayat/vertex-era-rules/blob/main/docs/rules/no-inline-objects.md',
		},
		schema: [],
		messages: {
			noInlineObject:
				"Avoid inline object in prop '{{propName}}'. Inline objects create new references on every render, causing unnecessary re-renders. Extract to a variable, constant, or useMemo hook.",
		},
	},
	create(context: {
		report: (descriptor: {
			node: TSESTree.Node;
			messageId: string;
			data: Record<string, unknown>;
		}) => void;
	}) {
		return {
			JSXAttribute(node: TSESTree.JSXAttribute) {
				try {
					if (!validateJSXAttributeStructure(node)) {
						return;
					}

					if (isInlineObject(node)) {
						const propName = getAttributeName(node) || 'unknown';
						const propValue = getPropValue(node);

						if (propValue) {
							context.report({
								node: propValue,
								messageId: 'noInlineObject',
								data: { propName },
							});
						}
					}
				} catch (error) {
					console.error('Error in no-inline-objects rule:', error);
				}
			},
		};
	},
	defaultOptions: [] as const,
};

export const noInlineFunctions = {
	meta: {
		type: 'problem' as const,
		docs: {
			description:
				'Prevent inline function declarations in JSX props. Inline functions create new references on every render, causing unnecessary re-renders of child components. Use useCallback or extract to component methods for better performance.',
			category: 'Best Practices',
			recommended: 'error' as const,
			url: 'https://github.com/AliEl-Zayat/vertex-era-rules/blob/main/docs/rules/no-inline-functions.md',
		},
		schema: [],
		messages: {
			noInlineFunction:
				"Avoid inline function in prop '{{propName}}'. Inline functions create new references on every render, causing unnecessary re-renders. Extract to a useCallback hook or component method.",
		},
	},
	create(context: {
		report: (descriptor: {
			node: TSESTree.Node;
			messageId: string;
			data: Record<string, unknown>;
		}) => void;
	}) {
		return {
			JSXAttribute(node: TSESTree.JSXAttribute) {
				try {
					if (!validateJSXAttributeStructure(node)) {
						return;
					}

					if (isInlineFunction(node)) {
						const propName = getAttributeName(node) || 'unknown';
						const propValue = getPropValue(node);

						if (propValue) {
							context.report({
								node: propValue,
								messageId: 'noInlineFunction',
								data: { propName },
							});
						}
					}
				} catch (error) {
					console.error('Error in no-inline-functions rule:', error);
				}
			},
		};
	},
	defaultOptions: [] as const,
};

export default {
	'no-inline-objects': noInlineObjects,
	'no-inline-functions': noInlineFunctions,
};

