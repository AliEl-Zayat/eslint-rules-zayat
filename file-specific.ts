/**
 * File-specific ESLint configurations
 * 
 * Provides targeted rule configurations for specific file patterns.
 * These can be used to apply rules only to certain types of files.
 * 
 * Usage:
 * ```typescript
 * import { iconFileConfig, serviceFileConfig, formFileConfig } from 'zayat-eslint-rules/file-specific';
 * 
 * export default [
 *   ...baseConfig,
 *   iconFileConfig,
 *   serviceFileConfig,
 *   // Your custom rules here
 * ];
 * ```
 */

import type { Linter } from 'eslint';

/**
 * Icon file configuration
 * Applies icon-specific rules to icon files
 */
export const iconFileConfig: Linter.Config = {
	files: ['**/icons/**/*.{ts,tsx}', '**/icon/**/*.{ts,tsx}', '**/*Icon.{ts,tsx}'],
	rules: {
		// Icon rules will be applied via plugin
		// These patterns match common icon file locations
	},
};

/**
 * Service file configuration
 * Applies service-specific rules to service layer files
 */
export const serviceFileConfig: Linter.Config = {
	files: ['**/services/**/*.{ts,tsx}', '**/api/**/*.{ts,tsx}', '**/*Service.{ts,tsx}'],
	rules: {
		// Service rules will be applied via plugin
		// These patterns match common service file locations
	},
};

/**
 * Form file configuration
 * Applies form-specific rules to form-related files
 */
export const formFileConfig: Linter.Config = {
	files: ['**/forms/**/*.{ts,tsx}', '**/*Form.{ts,tsx}', '**/*form*.{ts,tsx}'],
	rules: {
		// Form rules will be applied via plugin
		// These patterns match common form file locations
	},
};

/**
 * Component file configuration
 * Applies component-specific rules to React component files
 */
export const componentFileConfig: Linter.Config = {
	files: ['**/components/**/*.{ts,tsx}', '**/pages/**/*.{ts,tsx}', '**/views/**/*.{ts,tsx}'],
	rules: {
		// Component rules will be applied via plugin
		// These patterns match common component file locations
	},
};

/**
 * Test file configuration
 * Relaxes certain rules for test files
 */
export const testFileConfig: Linter.Config = {
	files: [
		'**/*.test.{ts,tsx}',
		'**/*.spec.{ts,tsx}',
		'**/__tests__/**/*.{ts,tsx}',
		'**/__mocks__/**/*.{ts,tsx}',
	],
	rules: {
		// Relax some rules for test files
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
	},
};

/**
 * Configuration file patterns
 * Relaxes rules for configuration files
 */
export const configFileConfig: Linter.Config = {
	files: [
		'*.config.{js,ts,mjs,cjs}',
		'vite.config.*',
		'vitest.config.*',
		'jest.config.*',
		'eslint.config.*',
		'tailwind.config.*',
		'postcss.config.*',
	],
	rules: {
		// Relax import rules for config files
		'import/no-default-export': 'off',
	},
};

/**
 * Main entry point configuration
 * Disables no-non-null-assertion for main.tsx entry files
 */
export const mainTsxConfig: Linter.Config = {
	files: ['main.tsx'],
	rules: {
		'@typescript-eslint/no-non-null-assertion': 'off',
	},
};

/**
 * Shadcn UI component configuration
 * Relaxes rules for shadcn UI components to accommodate their patterns
 */
export const shadcnUiConfig: Linter.Config = {
	files: ['**/ui/*.{ts,tsx}'],
	rules: {
		'custom/one-component-per-file': 'off',
		'custom/no-inline-objects': 'off',
		'custom/no-inline-functions': 'off',
		'custom/no-nested-ternary': 'off',
		'react-refresh/only-export-components': 'off',
		'react-hooks/purity': 'off',
		'@typescript-eslint/naming-convention': 'off',
		'custom/boolean-naming-convention': [
			'error',
			{
				allowedPrefixes: [
					'show',
					'hide',
					'as',
					'open',
					'close',
					'with',
					'can',
				],
			},
		],
	},
};

export default {
	iconFileConfig,
	serviceFileConfig,
	formFileConfig,
	componentFileConfig,
	testFileConfig,
	configFileConfig,
	mainTsxConfig,
	shadcnUiConfig,
};

