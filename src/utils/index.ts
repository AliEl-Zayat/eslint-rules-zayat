// Utils index - export all utilities
export * from './ast-helpers.js';
// Note: jsx-helpers has some duplicate exports with ast-helpers, export selectively
export {
	validateJSXAttributeStructure,
	getAttributeName,
	getAttributes,
	isInlineObject,
	isInlineFunction,
	getPropValue,
	validateJSXOpeningElement,
	validateJSXExpressionContainer as validateJSXExpressionContainerJSX,
	validateJSXIdentifier,
	isVariableReference,
	safeValidateJSX,
} from './jsx-helpers.js';
export * from './type-helpers.js';
export * from './prettier-detector.js';
export * from './ide-settings.js';

