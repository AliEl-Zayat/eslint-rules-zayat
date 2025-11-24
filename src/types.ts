/**
 * Type definitions for zayat-eslint-rules
 *
 * This module exports type definitions for consumers of the library
 * to get full TypeScript IntelliSense support.
 */

import type { Linter } from "eslint";
import type { TRuleName } from "./plugin/index.js";

/**
 * All available rule names in the plugin
 */
export type { TRuleName };

/**
 * Prefixed rule name format used in ESLint configs
 */
export type TPrefixedRuleName = `custom/${TRuleName}`;

/**
 * Rule severity levels (compatible with ESLint)
 */
export type TRuleSeverity = "off" | "warn" | "error" | 0 | 1 | 2;

/**
 * Configuration for a single rule
 */
export type TRuleConfig = TRuleSeverity | [TRuleSeverity, ...unknown[]];

/**
 * Rules configuration object type
 */
export type TRulesConfig = Partial<Record<TPrefixedRuleName, TRuleConfig>>;

/**
 * Available configuration preset names
 */
export type TConfigPreset =
  | "base"
  | "recommended"
  | "strict"
  | "typeAware"
  | "naming"
  | "redux";

/**
 * Plugin configuration structure
 */
export interface IPluginConfig {
  plugins: {
    custom: unknown;
  };
  rules: TRulesConfig;
}

/**
 * Full ESLint flat config array type
 */
export type TFlatConfig = Linter.Config[];

/**
 * Default export structure from the main module
 */
export interface IZayatEslintRulesExport {
  plugin: unknown;
  configs: {
    base: TFlatConfig;
    recommended: TFlatConfig;
    strict: TFlatConfig;
    typeAware: TFlatConfig;
  };
  utils: {
    detectPrettierConfig: () => Record<string, unknown> | null;
    getPrettierConfigForESLint: () => Record<string, unknown>;
    getRecommendedVSCodeSettings: () => Record<string, unknown>;
    getVSCodeSettingsJSON: () => string;
  };
}
