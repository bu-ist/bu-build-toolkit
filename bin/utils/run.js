/**
 * Command Execution Utilities
 *
 * Shared utilities for running commands across all CLI modules.
 * Provides consistent error handling, output streaming, and path resolution.
 *
 * Key Features:
 * - Streaming output (users see real-time progress)
 * - Proper error handling with exit codes
 * - Filtered output option (removes verbose stack traces)
 * - Path resolution relative to toolkit installation
 *
 * @module utils/run
 */

import { spawn } from 'child_process';
import path from 'path';
import { createRequire } from 'module';

// Create require for dynamic imports
const require = createRequire( import.meta.url );

/**
 * Run Command
 *
 * Executes a shell command and streams output to the console in real-time.
 * This is the foundational utility used by all other command runners.
 *
 * Process:
 * 1. Spawns child process with shell enabled
 * 2. Inherits stdio for real-time output
 * 3. Listens for close event to detect completion
 * 4. Rejects promise if exit code is non-zero
 *
 * @param {string}        cmd           - Command to run (e.g., 'node', 'npm', 'wp-scripts')
 * @param {Array<string>} cmdArgs       - Command arguments (default: [])
 * @param {Object}        options       - Additional spawn options (default: {})
 * @param {string}        options.cwd   - Working directory (default: process.cwd())
 * @param {boolean}       options.shell - Use shell (default: true)
 * @return {Promise<void>} Resolves when command completes successfully
 * @throws {Error} If command exits with non-zero code
 *
 * @example
 * await runCommand('node', ['script.js', '--flag']);
 * await runCommand('npm', ['install'], { cwd: '/path/to/project' });
 */
function runCommand( cmd, cmdArgs = [], options = {} ) {
	return new Promise( ( resolve, reject ) => {
		const child = spawn( cmd, cmdArgs, {
			stdio: 'inherit',
			shell: true,
			cwd: process.cwd(),
			...options,
		} );

		child.on( 'close', ( code ) => {
			if ( code !== 0 ) {
				reject(
					new Error( `Command failed with exit code ${ code }` )
				);
			} else {
				resolve();
			}
		} );

		child.on( 'error', reject );
	} );
}

/**
 * Run wp-scripts with Filtered Output
 *
 * Executes wp-scripts commands with output filtering to remove verbose stack traces.
 * This makes build output cleaner and easier to read during development.
 *
 * Filtering:
 * - Uses grep to remove lines starting with '    at ' (stack trace lines)
 * - Preserves error messages and warnings
 * - Uses '|| true' to prevent grep from causing non-zero exit
 *
 * @param {string}        scriptCommand - wp-scripts command (e.g., 'start', 'build')
 * @param {Array<string>} scriptArgs    - Additional arguments (default: [])
 * @return {Promise<void>}
 *
 * @example
 * await runWpScriptsFiltered('start', ['--hot']);
 * await runWpScriptsFiltered('build', ['--mode=production']);
 */
async function runWpScriptsFiltered( scriptCommand, scriptArgs = [] ) {
	// Resolve wp-scripts bin path relative to the module
	const wpScriptsPath = path.join(
		require.resolve( '@wordpress/scripts/package.json' ),
		'../bin/wp-scripts.js'
	);
	const allArgs = [ scriptCommand, '--color', ...scriptArgs ];

	// Use grep to filter out stack traces
	// eslint-disable-next-line prettier/prettier
	const cmd = `"${ wpScriptsPath }" ${ allArgs.join( ' ' ) } | grep -v '^    at ' || true`;

	await runCommand( cmd );
}

/**
 * Run wp-scripts without Filtering
 *
 * Executes wp-scripts commands with full, unfiltered output.
 * Useful for debugging when you need to see complete stack traces.
 *
 * @param {string}        scriptCommand - wp-scripts command (e.g., 'start', 'build')
 * @param {Array<string>} scriptArgs    - Additional arguments (default: [])
 * @return {Promise<void>}
 *
 * @example
 * await runWpScripts('build', ['--mode=production']);
 */
async function runWpScripts( scriptCommand, scriptArgs = [] ) {
	// Resolve wp-scripts bin path relative to the module
	const wpScriptsPath = path.join(
		require.resolve( '@wordpress/scripts/package.json' ),
		'../bin/wp-scripts.js'
	);
	const allArgs = [ scriptCommand, ...scriptArgs ];
	await runCommand( 'node', [ wpScriptsPath, ...allArgs ] );
}

/**
 * Run npm-run-all
 *
 * Executes npm-run-all for running multiple npm scripts in parallel or sequentially.
 * This is used for orchestrating complex build pipelines.
 *
 * @param {Array<string>} runArgs - Arguments for npm-run-all
 *                                - Use ['--parallel', 'script1', 'script2'] for parallel execution
 *                                - Use ['--sequential', 'script1', 'script2'] for sequential execution
 *                                - Default is sequential if no flag provided
 * @return {Promise<void>}
 *
 * @example
 * // Run scripts in parallel
 * await runNpmRunAll(['--parallel', 'watch:scripts', 'watch:theme-json']);
 *
 * // Run scripts sequentially
 * await runNpmRunAll(['build:theme-json', 'build:scripts', 'build:i18n']);
 */
async function runNpmRunAll( runArgs ) {
	// Resolve npm-run-all bin path relative to the module
	const npmRunAllPath = path.join(
		require.resolve( 'npm-run-all/package.json' ),
		'../bin/npm-run-all/index.js'
	);
	await runCommand( 'node', [ npmRunAllPath, ...runArgs ] );
}

/**
 * Get Theme Package.json
 *
 * Retrieves the package.json file from the current working directory (theme root).
 * This is used to detect theme-specific scripts and configuration.
 *
 * @return {Object} Parsed package.json contents
 * @throws {Error} If package.json doesn't exist or can't be parsed
 *
 * @example
 * const pkg = getThemePackage();
 * if (pkg.scripts['build:theme']) {
 *   // Theme has custom build script
 * }
 */
function getThemePackage() {
	return require( path.join( process.cwd(), 'package.json' ) );
}

export {
	runCommand,
	runWpScriptsFiltered,
	runWpScripts,
	runNpmRunAll,
	getThemePackage,
};
