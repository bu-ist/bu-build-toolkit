/**
 * BU Build Toolkit
 *
 * Main entry point for the BU Build Toolkit.
 * Provides utilities for configuring webpack builds for WordPress themes and plugins.
 * 
 * This module exports functions to create webpack configurations with sensible defaults
 * tailored for Boston University themes and plugins, including SASS options,
 * stats configuration, and path resolution helpers.
 *
 * @package bu-build-toolkit
 */

// Loads the base webpack configuration for BU themes and plugins.
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
 * These settings focus on errors and warnings for clarity.
 * 
 * Stats controls the verbosity of webpack output in the console.
 * 
 * @see https://webpack.js.org/configuration/stats/ Webpack Stats Configuration
 */
const defaultStatsConfig = {
	preset: 'errors-warnings',
	colors: true,
};

/**
 * Create a webpack configuration for a theme or plugin.
 * 
 * This function wraps createWebpackConfig and applies default settings.
 * It merges user-provided options with sensible defaults for BU themes.
 * 
 * This function is called in a theme or plugin's webpack.config.js file
 * with any desired parameters. `createConfig` then calls `createWebpackConfig`
 * with the final merged options and returns the webpack configuration that
 * webpack uses to build the theme or plugin assets.
 *
 * @param {Object}        options                       Configuration options
 * @param {Object}        options.themeEntryPoints      Entry points for theme-specific files (required)
 * @param {string}        options.sassCompiler          SASS compiler to use ('sass' or 'sass-embedded', optional - auto-detects if not specified)
 * @param {Object}        options.statsConfig           Webpack stats configuration (optional)
 * @param {Array}         options.loadPaths             Additional SASS load paths (merged with defaults)
 * @param {Object}        options.sassOptions           Custom SASS options (merged with defaults)
 * @param {RegExp|string} options.themeCleanKeepPattern Pattern for folders to keep when cleaning build directory (default: /^(fonts|images|blocks)\/)/)
 * @return {Array} Array of webpack configurations
 */
function createConfig( options = {} ) {
	const {
		themeEntryPoints = {},
		sassCompiler,
		statsConfig = defaultStatsConfig,
		loadPaths = [],
		sassOptions = {},
		themeCleanKeepPattern,
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
		themeCleanKeepPattern,
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
