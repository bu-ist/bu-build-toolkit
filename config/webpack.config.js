/**
 * WEBPACK CONFIG
 *
 * This is the base webpack configuration for BU themes and plugins.
 * It extends the default @wordpress/scripts webpack config and applies
 * BU-specific customizations that have been tested and refined.
 *
 * @see https://webpack.js.org/concepts/ Webpack Docs
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/scripts/config/webpack.config.js WordPress Webpack Config
 * @see https://developer.bu.edu/gutenberg/gutenberg-handbook/webpack-config-js/ BU Documentation
 */

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { mergeWithRules } = require( 'webpack-merge' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const path = require( 'path' );

/**
 * Create the webpack configuration for a theme or plugin.
 *
 * @param {Object} options                   Configuration options
 * @param {Object} options.themeEntryPoints  Entry points for theme-specific files
 * @param {Object} options.statsConfig       Webpack stats configuration
 * @param {Object} options.customSassOptions Custom SASS options including includePaths
 * @return {Array} Array of webpack configurations (blocks and theme)
 */
function createWebpackConfig( options ) {
	const {
		themeEntryPoints = {},
		statsConfig = {
			preset: 'errors-only',
			colors: true,
			errorStack: false, // Disable verbose stack traces in errors (webpack 5.105.0+)
		},
		customSassOptions = {},
	} = options;

	/**
	 * Block Config for @wordpress/scripts & webpack
	 *
	 * Do not modify the entry points of this config as it uses the `getWebpackEntryPoints`
	 * function from wp-scripts that finds all blocks and block.json files and builds a list
	 * of entrypoints for webpack from that automagically.
	 */
	const blocksConfig = {
		devtool: 'source-map', // Always build the sourcemap, even for production.
		resolveLoader: {
			modules: [
				'node_modules',
				path.resolve( __dirname, '../node_modules' ), // Toolkit's node_modules
			],
		},
		module: {
			rules: [
				{
					test: /\.(js|mjs)$/,
					loader: 'babel-loader',
					exclude: /node_modules\/(?!(@bostonuniversity)\/).*/,
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
		entry: {
			...themeEntryPoints,
		},
		devtool: 'source-map', // Always build the sourcemap, even for production.
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
	return [
		mergeWithRules( {
			devtool: 'replace',
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
			entry: 'merge',
			devtool: 'replace',
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
}

module.exports = createWebpackConfig;
