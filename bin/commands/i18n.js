/**
 * Internationalization (i18n) Commands Module
 *
 * Handles WordPress internationalization and translation preparation.
 * Ensures theme strings are properly marked for translation and
 * generates files needed for translation workflows.
 *
 * WordPress i18n Workflow:
 * 1. Mark strings in code with __(), _e(), etc.
 * 2. Add text domain to all i18n functions (build:wpi18n)
 * 3. Generate POT file with all translatable strings (build:wpmakepot)
 * 4. Translators use POT to create PO files for each language
 * 5. PO files are compiled to MO files for production use
 *
 * Output:
 * - languages/*.pot - Template file with all translatable strings
 * - Languages directory ready for translator PO/MO files
 *
 * Tools:
 * - node-wp-i18n for text domain and POT generation
 * - rimraf for cleaning old files
 *
 * @module commands/i18n
 * @see https://developer.wordpress.org/plugins/internationalization/
 */

const path = require( 'path' );
const { runCommand, runNpmRunAll } = require( '../utils/run' );

/**
 * Build Internationalization Files
 *
 * Complete i18n build pipeline that prepares theme for translation.
 * Runs all i18n steps in correct order.
 *
 * Process:
 * 1. Clean existing language files
 * 2. Add text domain to all i18n functions
 * 3. Generate POT file
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 *
 * @example
 * // Build all i18n files
 * await buildI18n([]);
 */
async function buildI18n( args ) {
	console.log( '\x1b[36m\x1b[1m\n► STEP 3: Building internationalization files\x1b[0m' );
	await runNpmRunAll( [ 'build:clean', 'build:wpi18n', 'build:wpmakepot' ] );
	console.log( '\x1b[32m✓ Internationalization files built successfully\x1b[0m' );
}

/**
 * Clean Language Files
 *
 * Removes all existing files in the languages directory.
 * This ensures a clean slate before regenerating i18n files.
 *
 * Cleaned Files:
 * - All .pot files (translation templates)
 * - All .po files (translation sources, if any)
 * - All .mo files (compiled translations, if any)
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 */
async function buildClean( args ) {
	const rimrafPath = path.resolve( __dirname, '../../node_modules/.bin/rimraf' );
	await runCommand( rimrafPath, [ 'languages/*' ] );
}

/**
 * Add Text Domain to PHP Files
 *
 * Automatically adds text domain parameter to all WordPress i18n functions
 * in PHP files. This is required for proper string translation.
 *
 * Process:
 * - Scans all PHP files for i18n functions: __(), _e(), _x(), etc.
 * - Adds text domain as second parameter if missing
 * - Uses theme's slug from style.css or package.json
 *
 * Before: __('Hello World')
 * After:  __('Hello World', 'theme-slug')
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 *
 * @see https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#text-domains
 */
async function buildWpi18n( args ) {
	const wpi18nPath = path.resolve( __dirname, '../../node_modules/.bin/wpi18n' );
	await runCommand( wpi18nPath, [ 'addtextdomain' ] );
}

/**
 * Generate POT File
 *
 * Creates a Portable Object Template (.pot) file containing all translatable
 * strings found in the theme. This file is used by translators to create
 * translations for different languages.
 *
 * POT File Contents:
 * - All translatable strings with context
 * - File locations where strings are used
 * - Translator comments from code
 * - Metadata (theme name, version, etc.)
 *
 * Output:
 * - languages/theme-slug.pot
 *
 * Usage:
 * - Translators use POT as template to create PO files
 * - One PO file per language (es_ES.po, fr_FR.po, etc.)
 * - PO files are compiled to MO for production
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 *
 * @see https://developer.wordpress.org/plugins/internationalization/localization/
 */
async function buildWpmakepot( args ) {
	const wpi18nPath = path.resolve( __dirname, '../../node_modules/.bin/wpi18n' );
	await runCommand( wpi18nPath, [ 'makepot', '--domain-path', 'languages' ] );
}

module.exports = {
	buildI18n,
	buildClean,
	buildWpi18n,
	buildWpmakepot,
};
