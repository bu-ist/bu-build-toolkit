/**
 * Testing Commands Module
 *
 * Handles automated testing commands for quality assurance.
 * Provides both unit testing and end-to-end testing capabilities.
 *
 * Test Types:
 * - Unit Tests: Fast, isolated tests of individual functions/components
 * - E2E Tests: Slower, comprehensive tests of user workflows
 *
 * Test Framework:
 * - Uses Jest for unit tests
 * - Uses Puppeteer for E2E tests
 * - Configured via @wordpress/scripts
 *
 * @module commands/test
 */

import { runWpScripts } from '../utils/run.js';

/**
 * Run End-to-End Tests
 *
 * Executes E2E tests using Puppeteer to simulate real user interactions.
 * Tests run in a headless browser and validate complete user workflows.
 *
 * Features:
 * - Browser automation with Puppeteer
 * - Real DOM and JavaScript execution
 * - Screenshot capture on failure
 * - Network request interception
 *
 * Test Files:
 * - Located in test/e2e/ or specs/e2e/
 * - Named *.test.js or *.spec.js
 *
 * Requirements:
 * - WordPress test environment
 * - Test site with test data
 *
 * @param {Array<string>} args - Additional CLI arguments (e.g., ['--puppeteer-interactive'])
 * @return {Promise<void>}
 * @throws {Error} If any test fails
 *
 * @example
 * // Run all E2E tests
 * await testE2e([]);
 *
 * // Run specific test file
 * await testE2e(['test/e2e/login.test.js']);
 *
 * // Run with interactive mode
 * await testE2e(['--puppeteer-interactive']);
 */
async function testE2e( args ) {
	await runWpScripts( 'test-e2e', args );
}

/**
 * Run Unit Tests
 *
 * Executes JavaScript unit tests using Jest.
 * Tests run quickly in Node.js environment without browser overhead.
 *
 * Features:
 * - Fast execution
 * - Code coverage reporting
 * - Snapshot testing
 * - Mock functions and modules
 *
 * Test Files:
 * - Located alongside source files or in test/unit/
 * - Named *.test.js or *.spec.js
 *
 * @param {Array<string>} args - Additional CLI arguments (e.g., ['--coverage', '--watch'])
 * @return {Promise<void>}
 * @throws {Error} If any test fails
 *
 * @example
 * // Run all unit tests
 * await testUnit([]);
 *
 * // Run with coverage report
 * await testUnit(['--coverage']);
 *
 * // Run in watch mode
 * await testUnit(['--watch']);
 *
 * // Run specific test file
 * await testUnit(['src/utils.test.js']);
 */
async function testUnit( args ) {
	await runWpScripts( 'test-unit-js', args );
}

export {
	testE2e,
	testUnit,
};
