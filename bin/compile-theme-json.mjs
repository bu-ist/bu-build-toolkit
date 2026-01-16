#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Theme.json Compiler
 *
 * A standalone compiler that combines modular theme.json source files into a single
 * theme.json file in the theme root. This enables themes to organize their theme.json
 * configuration into separate, maintainable modules.
 *
 * Directory Structure:
 * src/theme-json/
 *   ├── config.mjs    - Base configuration (version, customTemplates, templateParts)
 *   ├── settings.mjs  - Global settings (colors, typography, spacing, etc.)
 *   └── styles.mjs    - Global styles (elements, blocks, variations)
 *
 * File Format:
 * - Supports both .mjs and .js extensions
 * - Each file exports a default object
 * - Objects are merged in order: config → settings → styles
 *
 * Merge Order:
 * The merge order is intentional:
 * 1. config  - Sets foundational properties like version
 * 2. settings - Adds available options and features
 * 3. styles  - Applies visual styling using settings
 *
 * Output:
 * - Writes formatted JSON to theme.json in theme root
 * - 2-space indentation for readability
 * - Preserves all properties from source files
 *
 * Usage:
 * - Can be run directly: node compile-theme-json.mjs
 * - Integrated into bu-build: bu-build build:theme-json
 * - Auto-detected by bu-build start and bu-build build
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const cwd = process.cwd();
const sourceDir = path.join( cwd, 'src/theme-json' );
const outputFile = path.join( cwd, 'theme.json' );

/**
 * Try to Import a Module
 *
 * Attempts to import a JavaScript module file, trying multiple extensions.
 * This provides flexibility for themes to use either ESM (.mjs) or CommonJS (.js).
 *
 * Process:
 * 1. Tries each extension in order (.mjs, .js)
 * 2. Checks if file exists before attempting import
 * 3. Converts file path to file:// URL for ESM import
 * 4. Returns default export or empty object
 * 5. Returns null if file doesn't exist or import fails
 *
 * @param {string} basePath - Base path without extension (e.g., 'src/theme-json/config')
 * @return {Promise<Object|null>} Module's default export, empty object, or null if not found
 *
 * @example
 * const config = await tryImport('src/theme-json/config');
 * // Tries: config.mjs, then config.js
 */
async function tryImport( basePath ) {
	const extensions = [ '.mjs', '.js' ];

	for ( const ext of extensions ) {
		const filePath = basePath + ext;
		if ( fs.existsSync( filePath ) ) {
			try {
				const fileUrl = pathToFileURL( filePath ).href;
				const module = await import( fileUrl );
				return module.default || {};
			} catch ( error ) {
				console.error(
					`\x1b[31mError importing ${ filePath }:\x1b[0m`,
					error.message
				);
				return null;
			}
		}
	}

	return null;
}

/**
 * Compile Theme.json
 *
 * Main compilation function that orchestrates the theme.json build process.
 *
 * Process Flow:
 * 1. Verify src/theme-json directory exists
 * 2. Import config, settings, and styles modules
 * 3. Merge modules in order (config → settings → styles)
 * 4. Convert merged object to formatted JSON
 * 5. Write to theme.json in theme root
 *
 * Error Handling:
 * - Exits gracefully if src/theme-json doesn't exist
 * - Logs and exits with error if no source files found
 * - Propagates import errors to caller
 *
 * @throws {Error} If compilation fails
 * @return {Promise<void>}
 */
async function compileThemeJson() {
	// Check if source directory exists - if not, skip compilation
	if ( ! fs.existsSync( sourceDir ) ) {
		console.log(
			'No src/theme-json directory found. Skipping theme.json compilation.'
		);
		return;
	}

	// Import the module files
	const configPath = path.join( sourceDir, 'config' );
	const settingsPath = path.join( sourceDir, 'settings' );
	const stylesPath = path.join( sourceDir, 'styles' );

	const config = await tryImport( configPath );
	const settings = await tryImport( settingsPath );
	const styles = await tryImport( stylesPath );

	// Check if we got at least one module
	if ( config === null && settings === null && styles === null ) {
		console.error(
			'\x1b[31mNo theme.json source files found in src/theme-json/\x1b[0m'
		);
		console.error(
			'\x1b[31mExpected: config.mjs, settings.mjs, styles.mjs (or .js)\x1b[0m'
		);
		process.exit( 1 );
	}

	// Merge the objects (config first, then settings, then styles)
	const theme = {
		...( config || {} ),
		...( settings || {} ),
		...( styles || {} ),
	};

	// Convert to JSON with formatting
	const json = JSON.stringify( theme, null, 2 );

	// Write to theme.json
	fs.writeFileSync( outputFile, json );

	console.log(
		`\x1b[32m✓ theme.json compiled successfully to ${ outputFile }\x1b[0m`
	);
}

// Run the compiler
compileThemeJson().catch( ( error ) => {
	console.error( '\x1b[31mError compiling theme.json:\x1b[0m', error );
	process.exit( 1 );
} );
