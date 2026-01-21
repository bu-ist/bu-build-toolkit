/* eslint-disable no-console */
/**
 * Build Commands Module
 *
 * Handles all production build commands that compile and optimize
 * theme assets for deployment.
 *
 * Features:
 * - Orchestrates multi-step build pipeline
 * - Auto-detects theme.json source files
 * - Integrates with theme-specific build scripts
 * - Sequential execution in correct order
 *
 * Build Pipeline Order:
 * 1. build:theme-json (if src/theme-json exists)
 * 2. build:theme (if defined in theme's package.json)
 * 3. build:scripts (webpack - always runs)
 * 4. build:i18n (if defined in theme's package.json)
 * 5. build:version (if defined in theme's package.json)
 *
 * @module commands/build
 */

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
	runWpScriptsFiltered,
	runWpScripts,
	runNpmRunAll,
	getThemePackage,
	runCommand,
} from '../utils/run.js';

// ESM equivalents of __filename and __dirname
const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

/**
 * Build Production Assets
 *
 * Main build command that orchestrates the complete production build pipeline.
 * Automatically detects optional build steps and runs them in the correct order.
 *
 * Auto-Detection:
 * - Checks for src/theme-json/ directory
 * - Reads theme's package.json for optional scripts
 * - Builds list of steps to execute
 *
 * Execution:
 * - Multiple steps run sequentially using npm-run-all
 * - Single step (build:scripts only) runs directly
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 *
 * @example
 * // Standard production build
 * await build([]);
 *
 * // Build with custom webpack mode
 * await build(['--mode=development']);
 */
async function build( args ) {
	const themeJsonSrcDir = path.join( process.cwd(), 'src/theme-json' );
	const themePackage = getThemePackage();
	const buildSteps = [];

	// Check for theme.json compilation
	if ( fs.existsSync( themeJsonSrcDir ) ) {
		buildSteps.push( 'build:theme-json' );
	}

	// Check which build steps the theme has defined
	if ( themePackage.scripts ) {
		if ( themePackage.scripts[ 'build:theme' ] ) {
			buildSteps.push( 'build:theme' );
		}
	}

	buildSteps.push( 'build:scripts' );

	if ( themePackage.scripts ) {
		if ( themePackage.scripts[ 'build:i18n' ] ) {
			buildSteps.push( 'build:i18n' );
		}
		if ( themePackage.scripts[ 'build:version' ] ) {
			buildSteps.push( 'build:version' );
		}
	}

	// Show build header with step count
	console.log( chalk.cyan( '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' ) );
	console.log(
		chalk.cyan.bold(
			`  Building for production (${ buildSteps.length } steps)`
		)
	);
	console.log( chalk.cyan( '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' ) );

	if ( buildSteps.length > 1 ) {
		await runNpmRunAll( buildSteps );
	} else {
		await buildScripts( args );
	}
}

/**
 * Build Scripts
 *
 * Compiles webpack bundles for production with optimizations.
 * Output is filtered to remove verbose stack traces.
 *
 * Webpack Process:
 * - Compiles JavaScript files
 * - Compiles SCSS to CSS
 * - Minifies and optimizes output
 * - Generates asset manifest files
 * - Creates source maps
 *
 * Output:
 * - JavaScript bundles in build/js/
 * - CSS files in build/css/
 * - Block assets in build/blocks/
 * - Asset PHP files for WordPress dependency management
 *
 * @param {Array<string>} args - Additional CLI arguments passed to wp-scripts
 * @return {Promise<void>}
 */
async function buildScripts( args ) {
	console.log(
		chalk.cyan.bold( '\n▶ STEP 2: Compiling scripts and styles' )
	);
	await runWpScriptsFiltered( 'build', args );
}

/**
 * Build Theme.json
 *
 * Compiles modular theme.json source files into a single theme.json file.
 * This is typically the first step in the build pipeline.
 *
 * Source Files:
 * - src/theme-json/config.mjs - Version and templates
 * - src/theme-json/settings.mjs - Colors, typography, spacing
 * - src/theme-json/styles.mjs - Element and block styles
 *
 * Output:
 * - theme.json in theme root
 * - Formatted with 2-space indentation
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 */
async function buildThemeJson( args ) {
	console.log( chalk.cyan.bold( '\n▶ STEP 1: Compiling theme.json' ) );
	const compilerPath = path.resolve( __dirname, '../compile-theme-json.mjs' );
	await runCommand( 'node', [ compilerPath ] );
}

/**
 * Build Verbose
 *
 * Builds webpack with full, unfiltered output.
 * Useful for debugging build issues or analyzing bundle composition.
 *
 * @param {Array<string>} args - Additional CLI arguments passed to wp-scripts
 * @return {Promise<void>}
 */
async function buildVerbose( args ) {
	await runWpScripts( 'build', args );
}

/**
 * Update Version
 *
 * Updates version numbers and metadata across theme files based on package.json.
 * Ensures consistency between package.json, style.css, and built CSS files.
 *
 * Updated Files:
 * - style.css (WordPress theme header)
 * - build/css/theme.css (prepends header to minified output)
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 */
async function buildVersion( args ) {
	console.log(
		chalk.cyan.bold( '\n▶ STEP 4: Updating version information' )
	);
	const versionScript = path.resolve( __dirname, '../update-version.js' );
	await runCommand( 'node', [ versionScript ] );
}

export {
	build,
	buildScripts,
	buildThemeJson,
	buildVerbose,
	buildVersion,
};
