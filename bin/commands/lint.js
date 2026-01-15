/**
 * Linting Commands Module
 *
 * Handles all code quality and style checking commands.
 * Ensures code adheres to WordPress coding standards and best practices.
 *
 * Features:
 * - Multiple linters for different file types
 * - Auto-detection of PHP linting if defined
 * - Automatic fixing for JavaScript issues
 * - Consistent coding standards across projects
 *
 * Linters:
 * - CSS/SCSS: Stylelint with WordPress config
 * - JavaScript: ESLint with WordPress config
 * - Markdown: markdownlint for documentation
 * - package.json: npm package validator
 * - PHP: Custom PHPCS scripts (if defined by theme)
 *
 * @module commands/lint
 */

const path = require( 'path' );
const { runWpScripts, runNpmRunAll, getThemePackage, runCommand } = require( '../utils/run' );

/**
 * Run All Linters
 *
 * Executes all applicable linters sequentially.
 * Auto-detects and includes PHP linting if theme has lint:php script.
 *
 * Process:
 * 1. Lint CSS/SCSS files
 * 2. Lint JavaScript files
 * 3. Lint Markdown documentation
 * 4. Lint package.json
 * 5. Lint PHP files (if lint:php script exists)
 *
 * Exit Code:
 * - Exits with error if any linter finds issues
 * - Returns 0 only if all linters pass
 *
 * @param {Array<string>} args - Additional CLI arguments (unused)
 * @return {Promise<void>}
 * @throws {Error} If any linter fails
 */
async function lint( args ) {
	const lintSteps = [ 'lint:css', 'lint:js', 'lint:md', 'lint:pkg', 'lint:php' ];
	await runNpmRunAll( lintSteps );
}

/**
 * Lint CSS/SCSS
 *
 * Checks CSS and SCSS files against WordPress coding standards.
 * Uses Stylelint with @wordpress/stylelint-config.
 *
 * Checks:
 * - Property order and formatting
 * - Selector naming conventions
 * - Color format consistency
 * - SCSS syntax and best practices
 *
 * @param {Array<string>} args - Additional CLI arguments (e.g., ['--fix'] to auto-fix)
 * @return {Promise<void>}
 * @throws {Error} If linting errors are found
 */
async function lintCss( args ) {
	await runWpScripts( 'lint-style', args );
}

/**
 * Lint JavaScript
 *
 * Checks JavaScript files against WordPress coding standards.
 * Uses ESLint with @wordpress/eslint-plugin.
 *
 * Checks:
 * - Code style and formatting
 * - Variable naming conventions
 * - React best practices
 * - WordPress-specific patterns
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 * @throws {Error} If linting errors are found
 */
async function lintJs( args ) {
	await runWpScripts( 'lint-js', args );
}

/**
 * Fix JavaScript Linting Issues
 *
 * Automatically fixes JavaScript linting issues where possible.
 * Ignores /dev/ directory to skip development/testing files.
 *
 * Process:
 * 1. Runs ESLint with --fix flag
 * 2. Skips /dev/ directory
 * 3. Modifies files in-place
 * 4. Reports unfixable issues
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 */
async function lintJsFix( args ) {
	await runWpScripts( 'lint-js', [ '--fix', '--ignore-pattern', '/dev/', ...args ] );
}

/**
 * Lint Markdown
 *
 * Checks Markdown documentation files for formatting issues.
 * Ensures consistent documentation style across the project.
 *
 * Checks:
 * - Heading structure
 * - List formatting
 * - Link validity
 * - Code block syntax
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 * @throws {Error} If linting errors are found
 */
async function lintMd( args ) {
	await runWpScripts( 'lint-md-docs', args );
}

/**
 * Lint package.json
 *
 * Validates package.json for correctness and best practices.
 *
 * Checks:
 * - Required fields (name, version, etc.)
 * - Valid JSON syntax
 * - Proper dependency versioning
 * - Script naming conventions
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 * @throws {Error} If validation fails
 */
async function lintPkg( args ) {
	await runWpScripts( 'lint-pkg-json', args );
}

/**
 * Lint PHP Files
 *
 * Runs PHPCS on modified/untracked PHP files in git.
 * Uses phpcbf to auto-fix issues, then phpcs to report remaining issues.
 *
 * Checks:
 * - WordPress coding standards
 * - PHP version compatibility (7.4+)
 * - Security best practices
 * - Text domain consistency
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 * @throws {Error} If linting errors are found
 */
async function lintPhp( args ) {
	const scriptPath = path.resolve( __dirname, '../phpcs-lint-modified.sh' );
	await runCommand( 'bash', [ scriptPath, ...args ] );
}

/**
 * Lint All PHP Files
 *
 * Runs PHPCS on all PHP files in the project (not just modified).
 * Uses phpcbf to auto-fix issues, then phpcs to report remaining issues.
 *
 * Use Cases:
 * - Pre-deployment checks
 * - Enforcing standards on legacy code
 * - CI/CD pipeline validation
 *
 * @param {Array<string>} args - Additional CLI arguments
 * @return {Promise<void>}
 * @throws {Error} If linting errors are found
 */
async function lintPhpAll( args ) {
	const scriptPath = path.resolve( __dirname, '../phpcs-lint-all.sh' );
	await runCommand( 'bash', [ scriptPath, ...args ] );
}

module.exports = {
	lint,
	lintCss,
	lintJs,
	lintJsFix,
	lintMd,
	lintPkg,
	lintPhp,
	lintPhpAll,
};
