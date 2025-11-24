import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * ESLint configuration for the @zayat/eslint-custom-rules package itself.
 * This is used for linting the source code of this library.
 */
export default [
	// Ignore patterns
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'examples/**', // Examples are for demonstration, not production
			'configs/**', // Root configs are re-exports
			'*.js', // Don't lint root JS files
		],
	},

	// ESLint recommended rules
	eslint.configs.recommended,

	// TypeScript recommended rules
	...tseslint.configs.recommended,

	// TypeScript files configuration
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 2022,
			sourceType: 'module',
		},
		rules: {
			// Allow console in this library (for postinstall script and debugging)
			'no-console': 'off',

			// TypeScript specific
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			// Allow empty catch blocks with comment
			'no-empty': ['error', { allowEmptyCatch: true }],
		},
	},
];

