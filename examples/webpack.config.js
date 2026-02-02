/**
 * Example webpack.config.js for a theme using BU Build Toolkit
 *
 * This is what a theme's webpack.config.js would look like when using the toolkit.
 * Place this file in the root of your theme directory.
 * 
 * This uses CommonJS with async dynamic import() to load the ESM toolkit.
 * This approach avoids needing "type": "module" in your theme's package.json.
 */

/**
 * Theme Entry Points
 *
 * Define all the files that need to be compiled for your theme.
 * This can be SASS or JavaScript files.
 *
 * Format: 'output-path/name': './source-path/file'
 *
 * The key controls the output location within the build directory.
 * Example: 'css/admin': './src/scss/admin.scss' -> build/css/admin.css
 */
const themeEntryPoints = {
	// Styles
	'css/normalize': './src/scss/normalize.scss',
	'css/theme': './src/scss/theme.scss',
	'css/admin': './src/scss/admin.scss',
	'css/editor-styles': './src/scss/editor-styles.scss',
	'css/block-editor': './src/scss/block-editor.scss',
	'css/classic-editor': './src/scss/classic-editor.scss',

	// Blocks
	'css/blocks/blocks-bundled': './src/blocks/blocks-bundled.scss',
	'css/blocks/blocks-common': './src/blocks/blocks-common.scss',

	// Scripts
	'js/theme': './src/js/theme.js',
	'js/admin': './src/js/admin.js',
	'js/block-editor': './src/js/block-editor.js',
	'js/classic-editor': './src/js/classic-editor.js',
};

/**
 * Export the webpack configuration.
 * 
 * Since the toolkit is ESM, we use dynamic import() to load it.
 * Webpack supports async configs that return promises.
 */
module.exports = ( async () => {
	const { createConfig } = await import( '@bostonuniversity/bu-build-toolkit' );
	
	return createConfig( {
		themeEntryPoints,
		// Optional: Add custom SASS include paths
		// loadPaths: [ './custom/path' ],
		// Optional: Override SASS compiler (default is 'sass-embedded')
		// sassCompiler: 'sass',
		// Optional: Custom webpack stats configuration
		// statsConfig: { preset: 'verbose', colors: true },
		// Optional: Custom SASS options
		// sassOptions: { outputStyle: 'compressed' },
	} );
} )();
