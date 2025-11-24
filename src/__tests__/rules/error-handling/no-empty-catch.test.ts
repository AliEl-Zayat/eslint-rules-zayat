import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noEmptyCatch } from '../../../rules/error-handling/no-empty-catch.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
});

ruleTester.run('no-empty-catch', noEmptyCatch, {
	valid: [
		// Catch with error handling
		{
			code: `
				try {
					doSomething();
				} catch (error) {
					console.error(error);
				}
			`,
		},
		// Catch with intentionally ignored comment
		{
			code: `
				try {
					doSomething();
				} catch {
					// intentionally ignored
				}
			`,
		},
		// Catch with no-op comment
		{
			code: `
				try {
					doSomething();
				} catch {
					// no-op
				}
			`,
		},
		// Catch with deliberate ignore comment
		{
			code: `
				try {
					doSomething();
				} catch (e) {
					// deliberately ignored
				}
			`,
		},
		// Catch with used parameter
		{
			code: `
				try {
					doSomething();
				} catch (error) {
					handleError(error);
				}
			`,
		},
	],
	invalid: [
		// Catch with unused parameter
		{
			code: `
				try {
					doSomething();
				} catch (error) {
					console.log('Error occurred');
				}
			`,
			errors: [{ messageId: 'unusedParam' }],
		},
	],
});

