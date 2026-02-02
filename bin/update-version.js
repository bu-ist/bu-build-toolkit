#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Version Update Script
 *
 * Updates version numbers and metadata across multiple theme files based on package.json.
 * This ensures version consistency between package.json, style.css, and built CSS files.
 *
 * Updated Files:
 * - style.css (WordPress theme header)
 * - build/css/theme.css (adds header to minified output)
 *
 * Source of Truth:
 * - package.json - All metadata pulled from here
 *
 * WordPress Theme Header Fields:
 * - Theme Name (from package.json name)
 * - Theme URI (from package.json repository)
 * - Description (from package.json description)
 * - Version (from package.json version)
 * - Text Domain (from package.json name)
 *
 * Usage:
 * - Run during build: bu-build build includes this automatically if build:version is defined
 * - Run manually: node node_modules/@bostonuniversity/bu-build-toolkit/bin/update-version.js
 * - Via npm script: npm run build:version
 *
 * @see https://developer.wordpress.org/themes/basics/main-stylesheet-style-css/
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire( import.meta.url );

/**
 * Get Package Information
 *
 * Reads and parses package.json from the current working directory.
 *
 * @return {Object} Package.json contents
 * @throws {Error} If package.json doesn't exist or is invalid
 */
function getPackageInfo() {
	const packagePath = path.join( process.cwd(), 'package.json' );

	if ( ! fs.existsSync( packagePath ) ) {
		throw new Error( 'package.json not found in current directory' );
	}

	try {
		return require( packagePath );
	} catch ( error ) {
		throw new Error( `Failed to parse package.json: ${ error.message }` );
	}
}

/**
 * Generate CSS Header
 *
 * Creates a WordPress theme header comment block with metadata from package.json.
 *
 * @param {Object} packageInfo             - Package.json contents
 * @param {string} packageInfo.name        - Theme name/slug
 * @param {string} packageInfo.version     - Theme version
 * @param {string} packageInfo.description - Theme description
 * @param {string} packageInfo.repository  - Repository URL
 * @param {string} packageInfo.homepage    - Homepage URL
 * @return {string} Formatted CSS header comment
 */
function generateCssHeader( packageInfo ) {
	const {
		name = '',
		version = '1.0.0',
		description = '',
		repository = '',
		homepage = '',
	} = packageInfo;

	return `@charset "UTF-8";
/*
Theme Name: ${ name }
Theme URI: ${ repository }
Description: ${ description }
Author: Boston University Interactive Design
Website: ${ homepage }
Version: ${ version }
Text Domain: ${ name }
Template: responsive-framework-3x
*/
`;
}

/**
 * Update File with Header
 *
 * Updates a CSS file by replacing its content with the new header.
 * For style.css, replaces the entire file. For built CSS, prepends to existing content.
 *
 * @param {string}  filePath    - Path to file to update (relative to cwd)
 * @param {string}  header      - CSS header to write/prepend
 * @param {boolean} prependOnly - If true, prepend header to existing content
 * @return {Promise<void>}
 */
async function updateFile( filePath, header, prependOnly = false ) {
	const fullPath = path.join( process.cwd(), filePath );

	// Check if file exists
	if ( ! fs.existsSync( fullPath ) ) {
		// eslint-disable-next-line no-console
		console.log(
			chalk.yellow( `⚠️  Skipping ${ filePath } (file not found)` )
		);
		return;
	}

	try {
		if ( prependOnly ) {
			// Read existing content and prepend header
			const existingContent = fs.readFileSync( fullPath, 'utf-8' );
			const updatedContent = header + existingContent;
			fs.writeFileSync( fullPath, updatedContent, 'utf-8' );
		} else {
			// Replace entire file with header
			fs.writeFileSync( fullPath, header, 'utf-8' );
		}

		console.log( chalk.green( `✓ Updated ${ filePath }` ) );
	} catch ( error ) {
		console.error(
			chalk.red( `✗ Failed to update ${ filePath }: ${ error.message }` )
		);
		throw error;
	}
}

/**
 * Main Execution
 *
 * Orchestrates the version update process.
 */
async function main() {
	try {
		// Get package info
		const packageInfo = getPackageInfo();

		// Generate CSS header
		const cssHeader = generateCssHeader( packageInfo );

		// Update style.css (replace entire file)
		await updateFile( 'style.css', cssHeader, false );

		// Update build/css/theme.css (prepend to existing minified content)
		await updateFile( 'build/css/theme.css', cssHeader, true );

		console.log( '\n' + chalk.green( '✓ Version update complete!' ) );
	} catch ( error ) {
		console.error(
			'\n' + chalk.red( `✗ Version update failed: ${ error.message }` )
		);
		process.exit( 1 );
	}
}

// Run the script
main();
