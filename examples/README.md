# Examples

This folder contains example configurations for using `@zayat/eslint-custom-rules`.

## Available Examples

### Basic Usage (`basic-usage.ts`)

The simplest way to get started. Uses the recommended configuration which includes:

- Base ESLint + TypeScript rules
- Common custom rules for React best practices
- Prettier integration
- TypeScript naming conventions (T prefix for types, I prefix for interfaces)
- Redux typed hooks enforcement

### Strict Usage (`strict-usage.ts`)

For projects requiring maximum code quality. Enables ALL custom rules including:

- Icon file rules (single SVG per file, currentColor, memoized exports)
- Form configuration extraction
- Service layer response handling

### Type-Aware Usage (`type-aware-usage.ts`)

Demonstrates how to enable TypeScript rules that require type information. Useful for catching more type-related issues.

### Custom Plugin Usage (`custom-plugin-usage.ts`)

Shows how to use individual custom rules without the pre-built configurations. Useful when you need fine-grained control over which rules are enabled.

### Gradual Adoption (`gradual-adoption.ts`)

A phased approach for adopting rules in existing codebases. Start with warnings and progressively convert to errors as you clean up the codebase.

### With Ignores (`with-ignores.ts`)

Demonstrates how to use default ignore patterns and add custom ignores for your project.

## Quick Start

1. Copy one of the example files to your project root as `eslint.config.ts`
2. Adjust the configuration to match your project needs
3. Run `npx eslint .` to lint your code

## Tips

- Start with `basic-usage.ts` if you're new to the package
- Use `gradual-adoption.ts` for existing codebases with many issues
- Enable type-aware rules for maximum TypeScript safety (requires `parserOptions.project`)

