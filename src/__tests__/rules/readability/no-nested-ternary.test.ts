import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noNestedTernary } from '../../../rules/readability/no-nested-ternary.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
});

ruleTester.run('no-nested-ternary', noNestedTernary, {
	valid: [
		// Simple ternary
		{
			code: `const value = condition ? 'a' : 'b';`,
		},
		// Ternary with function calls
		{
			code: `const value = isActive ? getActiveValue() : getDefaultValue();`,
		},
		// Ternary with string values
		{
			code: `const element = isLoading ? 'loading' : 'content';`,
		},
		// Multiple separate ternaries (not nested)
		{
			code: `
				const a = condition1 ? 'x' : 'y';
				const b = condition2 ? 'p' : 'q';
			`,
		},
	],
	invalid: [
		// Nested ternary in consequent
		{
			code: `const value = a ? (b ? 'x' : 'y') : 'z';`,
			errors: [{ messageId: 'noNestedTernary' }],
		},
		// Nested ternary in alternate
		{
			code: `const value = a ? 'x' : (b ? 'y' : 'z');`,
			errors: [{ messageId: 'noNestedTernary' }],
		},
		// Classic nested ternary pattern
		{
			code: `const color = isActive ? 'green' : isError ? 'red' : 'gray';`,
			errors: [{ messageId: 'noNestedTernary' }],
		},
		// Deeply nested ternary
		{
			code: `const value = a ? b ? c ? 'd' : 'e' : 'f' : 'g';`,
			errors: [
				{ messageId: 'noNestedTernary' },
				{ messageId: 'noNestedTernary' },
			],
		},
	],
});

