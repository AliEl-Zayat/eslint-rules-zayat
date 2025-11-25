import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { booleanNamingConvention } from '../../../rules/naming/boolean-naming-convention.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		parserOptions: {
			project: false,
		},
	},
});

ruleTester.run('boolean-naming-convention', booleanNamingConvention, {
	valid: [
		// Boolean with 'is' prefix
		{
			code: `const isEnabled = true;`,
		},
		// Boolean with 'has' prefix
		{
			code: `const hasPermission = false;`,
		},
		// Boolean with 'should' prefix
		{
			code: `const shouldUpdate = true;`,
		},
		// Boolean with 'can' prefix
		{
			code: `const canEdit = false;`,
		},
		// Boolean with 'will' prefix
		{
			code: `const willChange = true;`,
		},
		// Boolean with 'as' prefix
		{
			code: `const asBoolean = true;`,
		},
		// Boolean with 'with' prefix
		{
			code: `const withAuth = false;`,
		},
		// Boolean with 'show' prefix
		{
			code: `const showModal = true;`,
		},
		// Boolean with 'hide' prefix
		{
			code: `const hideDialog = false;`,
		},
		// Boolean with 'open' prefix
		{
			code: `const openMenu = true;`,
		},
		// Boolean with 'close' prefix
		{
			code: `const closePanel = false;`,
		},
		// Allowed name: inset
		{
			code: `const inset = true;`,
		},
		// Allowed name: viewport
		{
			code: `const viewport = false;`,
		},
		// Allowed name: defaultOpen
		{
			code: `const defaultOpen = true;`,
		},
		// Allowed name: open
		{
			code: `const open = false;`,
		},
		// Non-boolean variable
		{
			code: `const name = "John";`,
		},
		// Non-boolean number
		{
			code: `const count = 42;`,
		},
		// Negation operation (returns boolean)
		{
			code: `const isValid = !someValue;`,
		},
		// Custom allowedNames option
		{
			code: `const customAllowed = true;`,
			options: [
				{
					allowedNames: ['customAllowed'],
				},
			],
		},
		// Custom allowedPrefixes option
		{
			code: `const customPrefix = true;`,
			options: [
				{
					allowedPrefixes: ['custom'],
				},
			],
		},
	],
	invalid: [
		// Boolean literal without proper prefix
		{
			code: `const enabled = true;`,
			errors: [{ messageId: 'booleanNaming' }],
		},
		// Boolean literal (false) without proper prefix
		{
			code: `const active = false;`,
			errors: [{ messageId: 'booleanNaming' }],
		},
		// Negation without proper prefix
		{
			code: `const valid = !someValue;`,
			errors: [{ messageId: 'booleanNaming' }],
		},
	],
});


