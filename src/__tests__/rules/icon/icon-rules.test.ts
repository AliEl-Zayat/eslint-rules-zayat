import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { singleSvgPerFile, svgCurrentcolor, memoizedExport } from '../../../rules/icon/icon-rules.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
});

// Test single-svg-per-file rule
ruleTester.run('single-svg-per-file', singleSvgPerFile, {
	valid: [
		// Single SVG
		{
			code: `
				function Icon() {
					return <svg><path d="M0 0" /></svg>;
				}
			`,
		},
		// No SVGs
		{
			code: `
				function Component() {
					return <div>Hello</div>;
				}
			`,
		},
	],
	invalid: [
		// Multiple SVGs in one file
		{
			code: `
				function IconA() {
					return <svg><path d="M0 0" /></svg>;
				}
				function IconB() {
					return <svg><circle r="10" /></svg>;
				}
			`,
			errors: [{ messageId: 'multipleSvgs' }],
		},
	],
});

// Test svg-currentcolor rule
ruleTester.run('svg-currentcolor', svgCurrentcolor, {
	valid: [
		// SVG using currentColor
		{
			code: `
				function Icon() {
					return (
						<svg>
							<path fill="currentColor" d="M0 0" />
						</svg>
					);
				}
			`,
		},
		// SVG with fill="none"
		{
			code: `
				function Icon() {
					return (
						<svg>
							<path fill="none" stroke="currentColor" d="M0 0" />
						</svg>
					);
				}
			`,
		},
		// Multi-color SVG (should be ignored)
		{
			code: `
				function Icon() {
					return (
						<svg>
							<path fill="#FF0000" d="M0 0" />
							<path fill="#00FF00" d="M1 1" />
						</svg>
					);
				}
			`,
		},
	],
	invalid: [
		// Single-color SVG with hardcoded color
		{
			code: `
				function Icon() {
					return (
						<svg>
							<path fill="#000000" d="M0 0" />
						</svg>
					);
				}
			`,
			output: `
				function Icon() {
					return (
						<svg>
							<path fill="currentColor" d="M0 0" />
						</svg>
					);
				}
			`,
			errors: [{ messageId: 'useCurrentColor' }],
		},
		// SVG with hardcoded stroke color
		{
			code: `
				function Icon() {
					return (
						<svg>
							<path stroke="#333" d="M0 0" />
						</svg>
					);
				}
			`,
			output: `
				function Icon() {
					return (
						<svg>
							<path stroke="currentColor" d="M0 0" />
						</svg>
					);
				}
			`,
			errors: [{ messageId: 'useCurrentColor' }],
		},
	],
});

// Test memoized-export rule
ruleTester.run('memoized-export', memoizedExport, {
	valid: [
		// Already memoized export
		{
			code: `
				import { memo } from 'react';
				function Icon() {
					return <svg><path d="M0 0" /></svg>;
				}
				export default memo(Icon);
			`,
		},
		// Component without export default
		{
			code: `
				function Component() {
					return <div>Hello</div>;
				}
				export { Component };
			`,
		},
	],
	invalid: [
		// Unmemoized icon export
		{
			code: `
				import React from 'react';
				function Icon() {
					return <svg><path d="M0 0" /></svg>;
				}
				export default Icon;
			`,
			output: `
				import React from 'react';
				function Icon() {
					return <svg><path d="M0 0" /></svg>;
				}
				export default React.memo(Icon);
			`,
			errors: [{ messageId: 'memoizeExport' }],
		},
	],
});

