/**
 * BU Build Toolkit
 *
 * Main entry point for the BU Build Toolkit.
 * Provides utilities for configuring webpack builds for WordPress themes and plugins.
 */

const createWebpackConfig = require( './config/webpack.config' );
const path = require( 'path' );

/**
 * Default SASS include paths for BU themes.
 * These are commonly used node_modules paths that themes typically need.
 */
const defaultIncludePaths = [
	'./node_modules/normalize-scss/sass',
	'./node_modules/mathsass/dist/',
	'./node_modules/@bostonuniversity',
];

/**
 * Default SASS options for BU themes.
 * These settings have been tested and refined for optimal performance.
 */
const defaultSassOptions = {
	includePaths: defaultIncludePaths,
	quietDeps: true, // Don't print warnings caused by dependencies
	silenceDeprecations: [
		'legacy-js-api',
		'global-builtin',
		'import',
		'slash-div',
		'color-functions',
		'color-4-api',
	],
};

/**
 * Default stats configuration for webpack output.
 */
const defaultStatsConfig = {
	preset: 'errors-warnings',
	colors: true,
};

/**
 * Create a webpack configuration for a theme or plugin.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.themeEntryPoints Entry points for theme-specific files (required)
 * @param {string} options.sassCompiler SASS compiler to use (default: 'sass-embedded')
 * @param {Object} options.statsConfig Webpack stats configuration (optional)
 * @param {Array} options.includePaths Additional SASS include paths (merged with defaults)
 * @param {Object} options.sassOptions Custom SASS options (merged with defaults)
 * @return {Array} Array of webpack configurations
 */
function createConfig( options = {} ) {
	const {
		themeEntryPoints = {},
		sassCompiler = 'sass-embedded',
		statsConfig = defaultStatsConfig,
		includePaths = [],
		sassOptions = {},
	} = options;

	// Merge custom include paths with defaults
	const mergedIncludePaths = [ ...defaultIncludePaths, ...includePaths ];

	// Merge custom SASS options with defaults
	const mergedSassOptions = {
		...defaultSassOptions,
		...sassOptions,
		includePaths: mergedIncludePaths,
	};

	return createWebpackConfig( {
		themeEntryPoints,
		sassCompiler,
		statsConfig,
		customSassOptions: mergedSassOptions,
	} );
}

/**
 * Helper to resolve paths relative to the theme/plugin root.
 *
 * @param {string} relativePath Path relative to theme root
 * @return {string} Absolute path
 */
function resolveThemePath( relativePath ) {
	return path.resolve( process.cwd(), relativePath );
}

module.exports = {
	createConfig,
	createWebpackConfig,
	defaultIncludePaths,
	defaultSassOptions,
	defaultStatsConfig,
	resolveThemePath,
};
