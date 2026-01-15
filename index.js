/**
 * BU Build Toolkit
 *
 * Main entry point for the BU Build Toolkit.
 * Provides utilities for configuring webpack builds for WordPress themes and plugins.
 */

const createWebpackConfig = require( './config/webpack.config' );
const path = require( 'path' );

/**
 * Default SASS load paths for BU themes.
 * These are commonly used node_modules paths that themes typically need.
 * 
 * Note: sass-loader v16+ uses 'loadPaths' (modern API) instead of 'includePaths' (legacy API)
 * 
 * The '.' and './node_modules' paths are included for backward compatibility with existing
 * imports that reference 'node_modules/...' directly in their @import statements.
 * New code should prefer importing without the 'node_modules/' prefix.
 */
const defaultLoadPaths = [
	'.', // Allow imports like: @import 'node_modules/@fortawesome/...'
	'./node_modules', // Allow imports like: @import '@fortawesome/...'
	'./node_modules/normalize-scss/sass',
	'./node_modules/mathsass/dist/',
	'./node_modules/@bostonuniversity',
];

/**
 * Default SASS options for BU themes.
 * These settings have been tested and refined for optimal performance.
 */
const defaultSassOptions = {
	loadPaths: defaultLoadPaths,
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
 * @param {Array} options.loadPaths Additional SASS load paths (merged with defaults)
 * @param {Object} options.sassOptions Custom SASS options (merged with defaults)
 * @return {Array} Array of webpack configurations
 */
function createConfig( options = {} ) {
	const {
		themeEntryPoints = {},
		sassCompiler = 'sass-embedded',
		statsConfig = defaultStatsConfig,
		loadPaths = [],
		sassOptions = {},
	} = options;

	// Merge custom load paths with defaults
	const mergedLoadPaths = [ ...defaultLoadPaths, ...loadPaths ];

	// Merge custom SASS options with defaults
	const mergedSassOptions = {
		...defaultSassOptions,
		...sassOptions,
		loadPaths: mergedLoadPaths,
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
	defaultLoadPaths,
	defaultSassOptions,
	defaultStatsConfig,
	resolveThemePath,
};
