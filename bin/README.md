# BU Build Toolkit - CLI Architecture

This directory contains the modular CLI implementation for `bu-build`.
`bu-build` is a CLI that helps execute various NPM scripts from a theme
or plugin repo making use of the `bu-build-toolkit` package. 

## Structure

```
bin/
├── bu-build.js              # Main CLI entry point
├── compile-theme-json.mjs   # Standalone theme.json compiler
├── phpcs-lint-all.sh        # PHP CodeSniffer lint all files
├── phpcs-lint-modified.sh   # PHP CodeSniffer lint modified files only
├── update-version.js        # Update version in style.css and theme.css
├── commands/                # Command modules organized by category
│   ├── build.js             # Build commands (build, build:scripts, etc.)
│   ├── watch.js             # Watch commands (start, watch:scripts, etc.)
│   ├── lint.js              # Linting commands (lint, lint:css, etc.)
│   ├── test.js              # Testing commands (test:e2e, test:unit)
│   ├── i18n.js              # Internationalization commands
│   └── misc.js              # Miscellaneous commands (format, help, etc.)
└── utils/
    └── run.js               # Shared utilities for running commands
```

## Command Modules

Each command module exports functions that handle specific CLI commands:

### build.js
Used for commands related to building code for production use. Runs once
and stops.

- `build()` - Orchestrates production build pipeline
- `buildScripts()` - Builds webpack bundles, including blocks & theme entrypoints
- `buildThemeJson()` - Compiles theme.json file from separate partials.
- `buildVerbose()` - Unfiltered webpack build
- `buildVersion()` - Update version in style.css and theme.css

### watch.js
Used for commands related to watching and compiling code for development
use. Will automatically keep watching the files and compiling when changes
are detected.

- `start()` - Orchestrates parallel watch tasks
- `watchScripts()` - Watches and builds webpack
- `watchThemeJson()` - Watches theme.json source files
- `watchVerbose()` - Unfiltered webpack watch

### lint.js
Helps with running Linting actions. 

- `lint()` - Runs all linters
- `lintCss()`, `lintJs()`, `lintMd()`, `lintPkg()` - Individual linters
- `lintJsFix()` - Auto-fix JS issues
- `lintPhp()` - Lint modified PHP files only
- `lintPhpAll()` - Lint all PHP files

### test.js
Helps run tests scripts. 

- `testE2e()` - End-to-end tests
- `testUnit()` - Unit tests

### i18n.js
Runs language translation related actions such as syncing text-domains
in files and generating POT files. 

- `buildI18n()` - Full i18n build pipeline
- `buildClean()` - Clean language files
- `buildWpi18n()` - Add text domains
- `buildWpmakepot()` - Generate POT files

### misc.js
Handles miscellaneous scripts such as Prettier formatting (across multiple files)

- `format()` - Format code with Prettier (Note: will update multiple files in the repo)
- `checkEngines()` - Validate Node/npm versions
- `checkLicenses()` - Check dependency licenses
- `help()` - Display help text

## Utilities

### utils/run.js

Shared utilities used by all command modules:

- `runCommand(cmd, args, options)` - Execute any command with streaming output
- `runWpScriptsFiltered(command, args)` - Run wp-scripts with filtered output
- `runWpScripts(command, args)` - Run wp-scripts with full output
- `runNpmRunAll(args)` - Run npm-run-all for parallel/sequential tasks
- `getThemePackage()` - Get current theme's package.json

## Adding New Commands

1. **Identify the category** - Determine which module the command belongs to
2. **Add the function** - Export a new async function in the appropriate module
3. **Register in bu-build.js** - Add the command to the `commands` registry
4. **Update help text** - Add to `misc.js` help() function

Example:
```javascript
// In commands/build.js
async function buildCustom( args ) {
    // Implementation
}
module.exports = { build, buildScripts, buildCustom };

// In bu-build.js
const commands = {
    'build:custom': buildCommands.buildCustom,
};
```

## Benefits of This Architecture

- **Separation of Concerns**: Each module handles one category of functionality
- **Maintainability**: Easy to find and update specific commands
- **Testability**: Individual modules can be tested in isolation
- **Extensibility**: New commands can be added without modifying existing code
- **Readability**: Main CLI file is minimal and clear
