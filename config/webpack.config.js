/**
 * WEBPACK CONFIG
 *
 * This is the base webpack configuration for BU themes and plugins.
 * It extends the default @wordpress/scripts webpack config and applies
 * BU-specific customizations that have been tested and refined.
 *
 * Note, this config runs two separate webpack configurations on after
 * the other to handle both block and theme/plugin assets:
 * 1) Blocks Config - handles block JavaScript and styles using
 *    the default entry point search function from @wordpress/scripts.
 *    This config automatically finds all blocks and block.json files and
 *    builds a list of entrypoints for webpack from that automagically.
 *
 * 2) Theme Config - handles additional theme/plugin scripts and styles
 *   using custom entry points defined when calling createConfig(). This
 *   config entirely replaces the default entry points from the BlocksConfig
 *   so that blocks are not processed a second time. Entry points are manually
 *   defined for all additional theme/plugin files that need to be built.
 *
 * Keep this in mind as issues can arise if both configs try to process
 * the same files. For example in the themeConfig we must adjust the clean
 * option to avoid deleting the blocks/ folder created by the blocksConfig
 * which runs first and outputs block files to build/blocks/. If we don't
 * do that then the themeConfig will delete those files when it runs.
 *
 * @see https://webpack.js.org/concepts/ Webpack Docs
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/scripts/config/webpack.config.js WordPress Webpack Config
 * @see https://developer.bu.edu/gutenberg/gutenberg-handbook/webpack-config-js/ BU Documentation
 */

// Load the default WordPress scripts webpack configuration.
import defaultConfig from '@wordpress/scripts/config/webpack.config.js';

// Get the mergeWithRules function from webpack-merge for custom merging of configurations.
import { mergeWithRules } from 'webpack-merge';

// Get required plugins.
import CopyWebpackPlugin from 'copy-webpack-plugin';
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';

// Load Node.js path module for resolving file paths.
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// ESM equivalents of __filename and __dirname
const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

// Create require function for dynamic imports of CommonJS modules
const require = createRequire( import.meta.url );

/**
 * Create the webpack configuration for a theme or plugin.
 *
 * @param {Object}        options                       Configuration options
 * @param {Object}        options.themeEntryPoints      Entry points for theme-specific files
 * @param {string}        options.sassCompiler          SASS compiler to use ('sass-embedded' or 'sass')
 * @param {Object}        options.statsConfig           Webpack stats configuration
 * @param {Object}        options.customSassOptions     Custom SASS options including loadPaths
 * @param {RegExp|string} options.themeCleanKeepPattern Pattern for folders to keep when cleaning build directory (default: /^(fonts|images|blocks)\/)/)
 * @return {Array} Array of webpack configurations
 */
function createWebpackConfig( options ) {
	const {
		themeEntryPoints = {},
		sassCompiler,
		statsConfig,
		customSassOptions = {},
		themeCleanKeepPattern = /^(fonts|images|blocks)\//, // Keep fonts/, images/, and blocks/ when cleaning build/
	} = options;

	// Only require sass compiler if explicitly specified, otherwise let sass-loader auto-detect
	const sassImplementation = sassCompiler
		? require( sassCompiler )
		: undefined;

	/**
	 * Block Config for @wordpress/scripts & webpack
	 *
	 * Do not modify the entry points of this config as it uses the `getWebpackEntryPoints`
	 * function from wp-scripts that finds all blocks and block.json files and builds a list
	 * of entrypoints for webpack from that automagically.
	 */
	const blocksConfig = {
		devtool: 'source-map', // Always build the sourcemap, even for production.

		// Tell webpack where to find loaders. This allows WordPress's default SVG rule
		// (which uses string loader names) to work even with file: installations.
		resolveLoader: {
			modules: [
				'node_modules',
				path.resolve( __dirname, '../node_modules' ), // Toolkit's node_modules
			],
		},

		module: {
			rules: [
				// Add babel-loader for @bostonuniversity packages in node_modules.
				// By default, babel-loader excludes all node_modules, but
				// we need to transpile our packages for compatibility because our packages
				// are not distributed as pre-transpiled code.
				{
					test: /\.(js|mjs)$/,
					loader: require.resolve( 'babel-loader' ),
					exclude: /node_modules\/(?!(@bostonuniversity)\/).*/,
					options: {
						presets: [
							require.resolve(
								'@wordpress/babel-preset-default'
							),
						],
					},
				},
				{
					test: /\.(sc|sa)ss$/,
					use: [
						{
							loader: require.resolve( 'css-loader' ),
							options: {
								sourceMap: true, // Always build the sourcemap, even for production.
							},
						},
						{
							loader: require.resolve( 'sass-loader' ),
							options: {
								sourceMap: true, // Always build the sourcemap, even for production.
								sassOptions: customSassOptions,
								...( sassImplementation && {
									implementation: sassImplementation,
								} ), // Specify SASS implementation if provided.
							},
						},
					],
				},
			],
		},
		stats: statsConfig,
	};

	/**
	 * Theme Config for @wordpress/scripts & webpack
	 *
	 * Used to compile additional stylesheets and scripts for the theme.
	 * This config entirely replaces the default entry points from the @wordpress/scripts
	 * defaultConfig. This ensures that the blocks are not processed a second time.
	 */
	const themeConfig = {
		// Output to build/ directory with custom clean options. This keeps themeConfig from
		// deleting the blocks/ folder created by blocksConfig which runs first.
		output: {
			path: path.resolve( process.cwd(), 'build' ), // Output to theme/plugin build/ directory.
			clean: {
				keep: themeCleanKeepPattern, // keep specified folders when cleaning build/.
			},
		},
		// Pass in the custom theme entry points defined when calling createConfig().
		entry: {
			...themeEntryPoints,
		},
		devtool: 'source-map', // Always build the sourcemap, even for production.

		// Tell webpack where to find loaders. This allows WordPress's default SVG rule
		// (which uses string loader names) to work even with file: installations.
		resolveLoader: {
			modules: [
				'node_modules',
				path.resolve( __dirname, '../node_modules' ), // Toolkit's node_modules
			],
		},

		module: {
			rules: [
				{
					test: /\.(sc|sa)ss$/,
					use: [
						{
							loader: require.resolve( 'css-loader' ),
							options: {
								sourceMap: true, // Always build the sourcemap, even for production.
							},
						},
						{
							loader: require.resolve( 'sass-loader' ),
							options: {
								sourceMap: true, // Always build the sourcemap, even for production.
								sassOptions: customSassOptions,
								...( sassImplementation && {
									implementation: sassImplementation,
								} ), // Specify SASS implementation if provided.
							},
						},
					],
				},
			],
		},
		stats: statsConfig,
		plugins: [
			// Grab the defaultConfig's plugins array and filter it to remove what we don't need.
			...defaultConfig.plugins.filter(
				// Remove CopyWebpackPlugin from the ThemeConfig so we don't copy block.json & php files into our output folder for the theme's files.
				( plugin ) => ! ( plugin instanceof CopyWebpackPlugin )
			),
			new RemoveEmptyScriptsPlugin(), // Add new plugin that removes empty script files for CSS only entries
		],
	};

	/**
	 * Now we use `webpack-merge` to combine our custom rules defined here with the base WordPress rules.
	 * Export the new modified configuration for webpack and use the webpack-merge functions to merge our modified configuration in.
	 * @see https://github.com/survivejs/webpack-merge?tab=readme-ov-file#mergewithrules
	 */
	const configs = [
		mergeWithRules( {
			devtool: 'replace',
			resolveLoader: {
				modules: 'prepend', // Add our paths before default resolution
			},
			module: {
				rules: {
					test: 'match',
					use: {
						loader: 'match',
						options: 'merge',
					},
				},
			},
			stats: 'replace',
		} )( defaultConfig, blocksConfig ),
		mergeWithRules( {
			entry: 'replace',
			devtool: 'replace',
			resolveLoader: {
				modules: 'prepend', // Add our paths before default resolution
			},
			module: {
				rules: {
					test: 'match',
					use: {
						loader: 'match',
						options: 'merge',
					},
				},
			},
			stats: 'replace',
			plugins: 'replace',
		} )( defaultConfig, themeConfig ),
	];

	return configs;
}

export default createWebpackConfig;
