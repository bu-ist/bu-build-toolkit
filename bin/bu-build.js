#!/usr/bin/env node

/**
 * BU Build Toolkit CLI
 *
 * Main entry point for the bu-build command-line interface.
 * This file acts as a router, delegating commands to their respective
 * handler modules organized by functionality.
 *
 * Architecture:
 * - Commands are organized into modules by category (watch, build, lint, etc.)
 * - Each module exports async functions that handle specific commands
 * - This file maintains a registry mapping command names to handlers
 * - All commands receive args array from CLI for additional parameters
 *
 * @example
 * bu-build start
 * bu-build build --production
 * bu-build lint:js --fix
 */

// Import command modules organized by functionality
const watchCommands = require( './commands/watch' );
const buildCommands = require( './commands/build' );
const lintCommands = require( './commands/lint' );
const testCommands = require( './commands/test' );
const i18nCommands = require( './commands/i18n' );
const miscCommands = require( './commands/misc' );

// Parse command-line arguments
// argv[0] = node, argv[1] = script path, argv[2] = command, argv[3+] = args
const command = process.argv[ 2 ];
const args = process.argv.slice( 3 );

/**
 * Command Registry
 *
 * Maps command strings to their handler functions.
 * When a user runs 'bu-build <command>', this registry determines
 * which function to execute.
 *
 * Handler functions receive:
 * @param {Array<string>} args - Additional CLI arguments after the command
 * @return {Promise<void>} - Resolves when command completes
 */
const commands = {
	// Watch commands
	'start': watchCommands.start,
	'watch:scripts': watchCommands.watchScripts,
	'watch:theme-json': watchCommands.watchThemeJson,
	'watch:verbose': watchCommands.watchVerbose,

	// Build commands
	'build': buildCommands.build,
	'build:scripts': buildCommands.buildScripts,
	'build:theme-json': buildCommands.buildThemeJson,
	'build:verbose': buildCommands.buildVerbose,
	'build:version': buildCommands.buildVersion,

	// i18n commands
	'build:i18n': i18nCommands.buildI18n,
	'build:clean': i18nCommands.buildClean,
	'build:wpi18n': i18nCommands.buildWpi18n,
	'build:wpmakepot': i18nCommands.buildWpmakepot,

	// Lint commands
	'lint': lintCommands.lint,
	'lint:css': lintCommands.lintCss,
	'lint:js': lintCommands.lintJs,
	'lint:js:fix': lintCommands.lintJsFix,
	'lint:md': lintCommands.lintMd,
	'lint:pkg': lintCommands.lintPkg,
	'lint:php': lintCommands.lintPhp,
	'lint:php:all': lintCommands.lintPhpAll,

	// Test commands
	'test:e2e': testCommands.testE2e,
	'test:unit': testCommands.testUnit,

	// Misc commands
	'format': miscCommands.format,
	'check-engines': miscCommands.checkEngines,
	'check-licenses': miscCommands.checkLicenses,
	'help': miscCommands.help,
};

/**
 * Main Execution Function
 *
 * Handles the CLI lifecycle:
 * 1. Validates command exists
 * 2. Routes to appropriate handler
 * 3. Catches and reports errors
 * 4. Sets appropriate exit codes
 *
 * Exit codes:
 * - 0: Success
 * - 1: Error (command not found or execution failed)
 */
async function main() {
	// Show help if no command provided or help explicitly requested
	if ( ! command || command === 'help' || command === '--help' || command === '-h' ) {
		miscCommands.help();
		process.exit( 0 );
	}

	// Check if command exists
	if ( ! commands[ command ] ) {
		console.error( `Unknown command: ${ command }` );
		console.error( `Run 'bu-build help' to see available commands.` );
		process.exit( 1 );
	}

	// Execute the command
	try {
		await commands[ command ]( args );
	} catch ( error ) {
		console.error( `Error running command: ${ error.message }` );
		process.exit( 1 );
	}
}

// Run the CLI
main();
