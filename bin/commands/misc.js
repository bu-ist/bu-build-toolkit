/* eslint-disable no-console */
/**
 * Miscellaneous Commands Module
 *
 * Handles utility commands that don't fit into other categories.
 * Includes code formatting, environment validation, and help.
 *
 * @module commands/misc
 */

const { runWpScripts } = require( '../utils/run' );
const chalk = require( 'chalk' );

/**
 * Format Code
 *
 * Automatically formats code files according to project style rules.
 * Uses Prettier with WordPress configuration.
 *
 * Formatted Files:
 * - JavaScript (.js, .jsx)
 * - CSS/SCSS (.css, .scss)
 * - JSON (.json)
 * - Markdown (.md)
 *
 * Features:
 * - Consistent code style across team
 * - Fixes formatting issues automatically
 * - Reduces code review noise
 *
 * @param {Array<string>} args - Additional CLI arguments (e.g., file patterns)
 * @return {Promise<void>}
 *
 * @example
 * // Format all files
 * await format([]);
 *
 * // Format specific files
 * await format(['src/\u002A\u002A/\u002A.js']);
 */
async function format( args ) {
	await runWpScripts( 'format', args );
}

/**
 * Check Node/npm Versions
 *
 * Validates that the current Node.js and npm versions meet the
 * requirements specified in package.json engines field.
 *
 * Purpose:
 * - Prevents build issues from version mismatches
 * - Ensures team uses compatible environments
 * - Catches version problems early
 *
 * Checks:
 * - Node.js version against engines.node
 * - npm version against engines.npm
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 * @throws {Error} If versions don't meet requirements
 *
 * @example
 * // Check if Node/npm versions are compatible
 * await checkEngines([]);
 */
async function checkEngines( args ) {
	try {
		await runWpScripts( 'check-engines', args );
		console.log(
			chalk.green( '✓ Node.js and npm versions are compatible' )
		);
	} catch ( error ) {
		console.error( chalk.red( '✗ Version compatibility check failed' ) );
		throw error;
	}
}

/**
 * Check Dependency Licenses
 *
 * Validates that all dependencies use acceptable open-source licenses.
 * Helps ensure legal compliance and avoid license conflicts.
 *
 * Validated Against:
 * - GPL-compatible licenses (for WordPress)
 * - Common open-source licenses (MIT, Apache, BSD, etc.)
 * - Custom whitelist if configured
 *
 * Reports:
 * - Dependencies with incompatible licenses
 * - Dependencies with unknown/missing licenses
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 * @throws {Error} If incompatible licenses are found
 *
 * @example
 * // Check all dependency licenses
 * await checkLicenses([]);
 */
async function checkLicenses( args ) {
	try {
		await runWpScripts( 'check-licenses', args );
		console.log(
			chalk.green( '✓ All dependency licenses are compatible' )
		);
	} catch ( error ) {
		console.error( chalk.red( '✗ License compatibility check failed' ) );
		throw error;
	}
}

/**
 * Show help.
 */
function help() {
	console.log( `
BU Build Toolkit - Commands:

Development:
  bu-build start              Start development mode with watch
  bu-build watch:scripts      Watch and build scripts (filtered output)
  bu-build watch:theme-json   Watch and compile theme.json from src/theme-json
  bu-build watch:verbose      Watch with full output (no filtering)

Building:
  bu-build build              Build for production
  bu-build build:scripts      Build scripts only (filtered output)
  bu-build build:theme-json   Compile theme.json from src/theme-json
  bu-build build:verbose      Build with full output (no filtering)
  bu-build build:version      Update version in style.css and theme.css
  bu-build build:i18n         Build internationalization files
  bu-build build:clean        Clean language files
  bu-build build:wpi18n       Add text domain to PHP files
  bu-build build:wpmakepot    Generate POT file

Linting:
  bu-build lint               Run all linters
  bu-build lint:css           Lint CSS/SCSS
  bu-build lint:js            Lint JavaScript
  bu-build lint:js:fix        Fix JavaScript linting issues
  bu-build lint:md            Lint Markdown
  bu-build lint:pkg           Lint package.json
  bu-build lint:php           Lint modified PHP files
  bu-build lint:php:all       Lint all PHP files

Other:
  bu-build format             Format code
  bu-build test:e2e           Run E2E tests
  bu-build test:unit          Run unit tests
  bu-build check-engines      Check Node/npm versions
  bu-build check-licenses     Check dependency licenses

For theme-specific commands, define them in your package.json:
  - watch:theme    (for custom watch tasks beyond theme.json)

The toolkit provides these features automatically:
  - build:version for WordPress themes (updates style.css and theme.css)
  - lint:php for PHP linting (uses phpcs from toolkit's composer dependencies)

For theme.json compilation:
  - Create src/theme-json/ directory with config.mjs, settings.mjs, styles.mjs
  - The toolkit will auto-detect and compile theme.json
	` );
}

module.exports = {
	format,
	checkEngines,
	checkLicenses,
	help,
};
