/**
 * Babel Configuration
 *
 * Example Babel configuration for BU themes and plugins.
 *
 * IMPORTANT: If you copy this file to your theme root, it will COMPLETELY OVERRIDE
 * the default @wordpress/babel-preset-default configuration. This means you will lose:
 *
 * - TypeScript support (@babel/preset-typescript)
 * - Automatic JSX runtime (no need for 'import React')
 * - Smart polyfill management with core-js
 * - Browserslist integration for browser targeting
 * - WordPress warning system integration
 * - Transform runtime optimization for smaller bundles
 *
 * ONLY copy this file if you need to add custom Babel presets or plugins.
 * Always extend @wordpress/babel-preset-default (as shown below) to keep WordPress features.
 *
 * Most themes DO NOT need a custom babel.config.js file.
 *
 * What's Already Included in @wordpress/babel-preset-default:
 * - @babel/preset-env (with browserslist integration)
 * - @babel/preset-typescript
 * - @babel/plugin-transform-react-jsx (with automatic runtime)
 * - @babel/plugin-transform-runtime
 * - @babel/plugin-syntax-import-attributes
 * - @wordpress/warning/babel-plugin
 *
 * You typically only need to add presets/plugins for specialized syntax or features
 * not covered above (e.g., Flow types, experimental proposals, etc.)
 */
module.exports = {
	presets: [
		// Keep WordPress's default configuration (TypeScript, JSX, polyfills, etc.)
		'@wordpress/babel-preset-default',

		// Add your custom presets here if needed
		// Example: [ '@babel/preset-flow', { all: true } ],
		// Note: @babel/preset-env and React JSX are already included above
	],
	plugins: [
		// Add your custom plugins here
		// Example: '@babel/plugin-proposal-class-properties',
	],
};
