#!/usr/bin/env node
/* eslint-disable no-console */

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

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalents of __filename and __dirname
const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

// Import command modules organized by functionality
import * as watchCommands from './commands/watch.js';
import * as buildCommands from './commands/build.js';
import * as lintCommands from './commands/lint.js';
import * as testCommands from './commands/test.js';
import * as i18nCommands from './commands/i18n.js';
import * as miscCommands from './commands/misc.js';

// Read version from package.json
const packageJsonPath = path.resolve( __dirname, '../package.json' );
const packageJson = JSON.parse( fs.readFileSync( packageJsonPath, 'utf8' ) );

/**
 * Display CLI Header
 *
 * Shows the toolkit name, version, and package identifier.
 * This provides visual confirmation of which tool is running.
 * Uses BU Red (#CC0000) for branding.
 */
function displayHeader() {
	// eslint-disable-next-line prettier/prettier
	console.log( chalk.rgb( 204, 0, 0 )( '▗▄▄▖  ▗▄▖  ▗▄▄▖▗▄▄▄▖▗▄▖ ▗▖  ▗▖    ▗▖ ▗▖▗▖  ▗▖▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖▗▄▄▖  ▗▄▄▖▗▄▄▄▖▗▄▄▄▖▗▖  ▗▖' ) ); // eslint-disable-next-line prettier/prettier
	console.log( chalk.rgb( 204, 0, 0 )( '▐▌ ▐▌▐▌ ▐▌▐▌     █ ▐▌ ▐▌▐▛▚▖▐▌    ▐▌ ▐▌▐▛▚▖▐▌  █  ▐▌  ▐▌▐▌   ▐▌ ▐▌▐▌     █    █   ▝▚▞▘ ' ) ); // eslint-disable-next-line prettier/prettier
	console.log( chalk.rgb( 204, 0, 0 )( '▐▛▀▚▖▐▌ ▐▌ ▝▀▚▖  █ ▐▌ ▐▌▐▌ ▝▜▌    ▐▌ ▐▌▐▌ ▝▜▌  █  ▐▌  ▐▌▐▛▀▀▘▐▛▀▚▖ ▝▀▚▖  █    █    ▐▌  ' ) ); // eslint-disable-next-line prettier/prettier
	console.log( chalk.rgb( 204, 0, 0 )( '▐▙▄▞▘▝▚▄▞▘▗▄▄▞▘  █ ▝▚▄▞▘▐▌  ▐▌    ▝▚▄▞▘▐▌  ▐▌▗▄█▄▖ ▝▚▞▘ ▐▙▄▄▖▐▌ ▐▌▗▄▄▞▘▗▄█▄▖  █    ▐▌  ' ) ); // eslint-disable-next-line prettier/prettier
	console.log( chalk.cyan( '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' ) ); // eslint-disable-next-line prettier/prettier
	console.log( chalk.cyan.bold( `  BU Build Tools - Version ${ packageJson.version }` ) );
	console.log( chalk.cyan( `  ${ packageJson.name }` ) ); // eslint-disable-next-line prettier/prettier
	console.log( chalk.cyan( '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' ) ); // eslint-disable-next-line prettier/prettier
}

/**
 * Parse Command-Line Arguments
 *
 * When running a command like `bu-build build --production`,
 * command = 'build'
 * args = ['--production']
 *
 * `process.argv` contains an array of the command-line arguments:
 * - process.argv[0]: Node.js executable path
 * - process.argv[1]: Path to this script (bu-build.js)
 * - process.argv[2]: The command to execute (e.g., 'build', 'start')
 * - process.argv[3+]: Any additional arguments passed to the command
 *
 * @example
 * bu-build lint:js --fix
 * command = 'lint:js'
 * args = ['--fix']
 */
const command = process.argv[ 2 ]; // Get the command to run.
const args = process.argv.slice( 3 ); // Get all arguments after the command

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
	start: watchCommands.start,
	'watch:scripts': watchCommands.watchScripts,
	'watch:theme-json': watchCommands.watchThemeJson,
	'watch:verbose': watchCommands.watchVerbose,

	// Build commands
	build: buildCommands.build,
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
	lint: lintCommands.lint,
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
	format: miscCommands.format,
	'check-engines': miscCommands.checkEngines,
	'check-licenses': miscCommands.checkLicenses,
	help: miscCommands.help,
};

/**
 * Main Execution Function
 *
 * Handles the CLI lifecycle:
 * 1. Displays header (only once per build session)
 * 2. Validates command exists
 * 3. Routes to appropriate handler
 * 4. Catches and reports errors
 * 5. Sets appropriate exit codes
 *
 * Exit codes:
 * - 0: Success
 * - 1: Error (command not found or execution failed)
 */
async function main() {
	// Display header once per session using environment variable
	// This prevents duplicate headers in nested child commands spawned
	// from a single bu-build invocation.
	if ( ! process.env.BU_BUILD_HEADER_SHOWN ) {
		displayHeader();
		process.env.BU_BUILD_HEADER_SHOWN = 'true';
	}

	// Show help if no command provided or help explicitly requested
	if (
		! command ||
		command === 'help' ||
		command === '--help' ||
		command === '-h'
	) {
		miscCommands.help();
		process.exit( 0 );
	}

	// Check if command exists
	if ( ! commands[ command ] ) {
		console.error( chalk.red( `Unknown command: ${ command }` ) );
		console.error(
			chalk.red( "Run 'bu-build help' to see available commands." )
		);
		process.exit( 1 );
	}

	// Execute the command the user requested.
	try {
		await commands[ command ]( args );
	} catch ( error ) {
		console.error(
			chalk.red( `Error running command: ${ error.message }` )
		);
		process.exit( 1 );
	}
}

// Run the CLI
main();
