/**
 * Watch Commands Module
 *
 * Handles all development watch commands that monitor files for changes
 * and automatically rebuild when changes are detected.
 *
 * Features:
 * - Smart detection of theme.json source files
 * - Parallel execution of multiple watch tasks
 * - Filtered output for cleaner console
 * - Optional verbose mode for debugging
 *
 * @module commands/watch
 */

const path = require( 'path' );
const fs = require( 'fs' );
const { runWpScriptsFiltered, runWpScripts, runNpmRunAll, getThemePackage } = require( '../utils/run' );

/**
 * Start Development Mode
 *
 * Main watch command that orchestrates all development watchers.
 * Automatically detects and runs appropriate watch tasks in parallel.
 *
 * Auto-Detection:
 * 1. Always includes watch:scripts (webpack)
 * 2. Adds watch:theme-json if src/theme-json/ exists
 * 3. Adds watch:theme if defined in theme's package.json
 *
 * Execution:
 * - Multiple tasks run in parallel using npm-run-all
 * - Single task runs directly (no need for parallelization)
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 *
 * @example
 * // Start with default settings
 * await start([]);
 *
 * // Start with hot module replacement
 * await start(['--hot']);
 */
async function start( args ) {
	const themeJsonSrcDir = path.join( process.cwd(), 'src/theme-json' );
	const themePackage = getThemePackage();
	
	const tasks = [];
	
	// Always include webpack watch
	tasks.push( 'watch:scripts' );
	
	// Check if theme.json source directory exists
	if ( fs.existsSync( themeJsonSrcDir ) ) {
		tasks.push( 'watch:theme-json' );
	}
	
	// Check if theme has a custom watch:theme script
	if ( themePackage.scripts && themePackage.scripts[ 'watch:theme' ] ) {
		tasks.push( 'watch:theme' );
	}

	// Show watch header with task count
	console.log( '\x1b[36m\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m' );
	console.log( `\x1b[36m\x1b[1m  Starting development mode (${tasks.length} watchers)\x1b[0m` );
	console.log( '\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n' );

	if ( tasks.length > 1 ) {
		// Run multiple watch tasks in parallel using npm-run-all
		// These need to be actual npm scripts, not bu-build commands
		await runNpmRunAll( [ '--parallel', ...tasks ] );
	} else {
		// Just run watch:scripts directly
		await watchScripts( args );
	}
}

/**
 * Watch Scripts
 *
 * Watches webpack entry points and rebuilds when source files change.
 * Output is filtered to remove verbose stack traces for cleaner console.
 *
 * Watched Files:
 * - JavaScript files in src/
 * - SCSS files in src/
 * - Block files (automatically detected via block.json)
 *
 * @param {Array<string>} args - Additional CLI arguments passed to wp-scripts
 * @return {Promise<void>}
 */
async function watchScripts( args ) {
	console.log( '\x1b[36m\x1b[1m\n► WATCH 1: Scripts and styles\x1b[0m' );
	await runWpScriptsFiltered( 'start', args );
}

/**
 * Watch Theme.json
 *
 * Watches src/theme-json/ directory and recompiles theme.json when any
 * source file changes. Uses nodemon for efficient file watching.
 *
 * Watched Files:
 * - src/theme-json/config.mjs (or .js)
 * - src/theme-json/settings.mjs (or .js)
 * - src/theme-json/styles.mjs (or .js)
 *
 * Process:
 * 1. Nodemon watches src/theme-json directory
 * 2. On change, executes compile-theme-json.mjs
 * 3. Compiler merges and outputs theme.json
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 */
async function watchThemeJson( args ) {
	console.log( '\x1b[36m\x1b[1m\n► WATCH 2: Theme.json changes\x1b[0m' );
	const { runCommand } = require( '../utils/run' );
	const nodemonPath = path.resolve( __dirname, '../../node_modules/.bin/nodemon' );
	const compilerPath = path.resolve( __dirname, '../compile-theme-json.mjs' );
	await runCommand( nodemonPath, [ '--watch', 'src/theme-json', '--exec', `node ${ compilerPath }` ] );
}

/**
 * Watch Verbose
 *
 * Watches webpack with full, unfiltered output.
 * Useful for debugging build issues when you need complete stack traces.
 *
 * @param {Array<string>} args - Additional CLI arguments passed to wp-scripts
 * @return {Promise<void>}
 */
async function watchVerbose( args ) {
	await runWpScripts( 'start', args );
}

module.exports = {
	start,
	watchScripts,
	watchThemeJson,
	watchVerbose,
};
