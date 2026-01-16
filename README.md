# BU Build Toolkit

A centralized set of build tools for compiling WordPress themes and plugins, built on top of `@wordpress/scripts` and Webpack. This toolkit maintains all build dependencies and configuration in one place, eliminating the need to manage these in each individual theme or plugin repository.

Each major version of this Toolkit should be well documented with what setup is needed in each theme or plugin repo as well as instructions on how to update a repo to the next major version of this toolkit. 

The toolkit should NOT make changes that would break or alter the generated output of a theme or plugin except in major versions.

## Features

- **Centralized Dependencies**: All build-related dependencies (`@wordpress/scripts`, webpack, loaders, plugins) are managed in this single package
- **Tested Configuration**: Webpack, Babel, ESLint, and Stylelint.
- **Easy Integration**: Themes/plugins only need minimal configuration (entry points and theme-specific settings)
- **Consistent Builds**: Ensures all BU themes and plugins use the same build process and tooling versions


## Installation

In your theme or plugin:

```bash
npm install --save-dev @bostonuniversity/bu-build-toolkit
```

## Usage

### 1. Create a webpack configuration file

Create a `webpack.config.js` in your theme/plugin root:

```javascript
const { createConfig } = require( '@bostonuniversity/bu-build-toolkit' );

// Define your theme's entry points
const themeEntryPoints = {
	// Styles
	'css/normalize': './src/scss/normalize.scss',
	'css/theme': './src/scss/theme.scss',
	'css/admin': './src/scss/admin.scss',
	'css/editor-styles': './src/scss/editor-styles.scss',
	'css/block-editor': './src/scss/block-editor.scss',
	'css/classic-editor': './src/scss/classic-editor.scss',
	
	// Blocks
	'css/blocks/blocks-bundled': './src/blocks/blocks-bundled.scss',
	'css/blocks/blocks-common': './src/blocks/blocks-common.scss',
	
	// Scripts
	'js/theme': './src/js/theme.js',
	'js/admin': './src/js/admin.js',
	'js/block-editor': './src/js/block-editor.js',
	'js/classic-editor': './src/js/classic-editor.js',
};

module.exports = createConfig( {
	themeEntryPoints,
} );
```

### 2. Configure your package.json

The toolkit provides a `bu-build` CLI that handles all common build tasks. Add these scripts to your theme's package.json:

```json
{
  "scripts": {
    "postinstall": "cd node_modules/@bostonuniversity/bu-build-toolkit && composer install",
    "check-engines": "bu-build check-engines",
    "check-licenses": "bu-build check-licenses",
    "start": "bu-build start",
    "watch:scripts": "bu-build watch:scripts",
    "watch:theme-json": "bu-build watch:theme-json",
    "format": "bu-build format",
    "lint": "bu-build lint",
    "lint:css": "bu-build lint:css",
    "lint:js": "bu-build lint:js",
    "lint:js:fix": "bu-build lint:js:fix",
    "lint:md": "bu-build lint:md",
    "lint:pkg": "bu-build lint:pkg",
    "lint:php": "bu-build lint:php",
    "lint:php:all": "bu-build lint:php:all",
    "test:e2e": "bu-build test:e2e",
    "test:unit": "bu-build test:unit",
    "build": "bu-build build",
    "build:scripts": "bu-build build:scripts",
    "build:theme-json": "bu-build build:theme-json",
    "build:i18n": "bu-build build:i18n",
    "build:clean": "bu-build build:clean",
    "build:wpi18n": "bu-build build:wpi18n",
    "build:wpmakepot": "bu-build build:wpmakepot",
    "build:version": "bu-build build:version"
  },
  "devDependencies": {
    "@bostonuniversity/bu-build-toolkit": "^0.1.0"
  }
}
```

**Note:** The `postinstall` script ensures PHP dependencies (like PHP_CodeSniffer for linting) are installed automatically.

**Theme.json Compilation** (automatic, no script needed):

If your theme has a `src/theme-json/` directory with modular files, the toolkit automatically compiles them:

```
src/theme-json/
  ├── config.mjs       (or .js) - Version, customTemplates, templateParts
  ├── settings.mjs     (or .js) - Colors, typography, spacing, etc.
  └── styles.mjs       (or .js) - Element styles
```

The toolkit will automatically detect this directory and:
- Compile to `theme.json` during build
- Watch for changes during development
- Merge config → settings → styles in that order

The `bu-build` CLI automatically provides:
- Theme.json compilation and watch (if `src/theme-json/` exists)
- Version management (`build:version`) - updates style.css and theme.css
- PHP linting (`lint:php`, `lint:php:all`) - uses toolkit's phpcs dependencies

### 3. Copy config files (optional)

The toolkit includes config files that you can reference or copy:

**Babel**: Copy `node_modules/@bostonuniversity/bu-build-toolkit/config/babel.config.js` to your theme root if you need to customize

**ESLint**: Copy or extend from `node_modules/@bostonuniversity/bu-build-toolkit/config/.eslintrc.json`

**Stylelint**: Copy or extend from `node_modules/@bostonuniversity/bu-build-toolkit/config/.stylelintrc`

**SVGO**: Reference from `node_modules/@bostonuniversity/bu-build-toolkit/config/svgo.config.js`

**PHPCS**: Extend from `node_modules/@bostonuniversity/bu-build-toolkit/config/.phpcs.xml.dist` (see PHP Linting Setup below)

Or reference the defaults provided by this toolkit directly in your package.json:

```json
{
  "eslintConfig": {
    "extends": "./node_modules/@bostonuniversity/bu-build-toolkit/config/.eslintrc.json"
  },
  "stylelint": {
    "extends": "./node_modules/@bostonuniversity/bu-build-toolkit/config/.stylelintrc"
  },
  "svgo": "./node_modules/@bostonuniversity/bu-build-toolkit/config/svgo.config.js"
}
```

## Advanced Configuration

### Custom SASS Include Paths

Add additional SASS include paths:

```javascript
const { createConfig } = require( '@bostonuniversity/bu-build-toolkit' );

module.exports = createConfig( {
	themeEntryPoints: { /* your entries */ },
	loadPaths: [
		'./custom/sass/path',
	],
} );
```

### Custom SASS Options

Override SASS compiler options:

```javascript
const { createConfig } = require( '@bostonuniversity/bu-build-toolkit' );

module.exports = createConfig( {
	themeEntryPoints: { /* your entries */ },
	sassOptions: {
		outputStyle: 'compressed',
	},
} );
```

### Different SASS Compiler
By default `sass-loader` (within Webpack) will automatically choose which SASS 
compiler to use. If `sass-embedded` is set as an `optionalDependency` package and
works on your system it will be used. `sass-embedded` is usually faster as it runs
as native code on your system instead of a Javascript implementation. However it
does not work on all operating systems and CPU's. 

There are times where a theme developer may need to force a specific SASS
compiler: `sass` (dart-sass in JS), `sass-embedded` (dart-sass but native code), or
`node-sass`. If so you can specify the `sassCompiler` to use and the toolkit will
pass this to `sass-loader`. 

Switch between `sass-embedded` (default, faster) and `sass`, or `node-sass`:

```javascript
const { createConfig } = require( '@bostonuniversity/bu-build-toolkit' );

module.exports = createConfig( {
	themeEntryPoints: { /* your entries */ },
	sassCompiler: 'sass', // or 'sass-embedded'
} );
```

### Custom Webpack Stats

Modify webpack output statistics:

```javascript
const { createConfig } = require( '@bostonuniversity/bu-build-toolkit' );

module.exports = createConfig( {
	themeEntryPoints: { /* your entries */ },
	statsConfig: {
		preset: 'verbose',
		colors: true,
	},
} );
```

## What's Included

### Dependencies
- `@wordpress/scripts` - WordPress build scripts (includes webpack, css-loader, sass-loader, etc.)
- `@wordpress/stylelint-config` - WordPress Stylelint configuration
- `webpack-merge` - Merge webpack configurations
- `sass-embedded` - Fast SASS compiler
- `webpack-remove-empty-scripts` - Removes empty JS files from CSS-only entries
- `npm-run-all` - Run multiple npm scripts in parallel or sequentially
- `nodemon` - Watch files for changes and re-run commands
- `rimraf` - Cross-platform file/directory removal
- `node-wp-i18n` - WordPress internationalization tools (makepot, addtextdomain)

### PHP Dependencies (Composer)
- `wp-coding-standards/wpcs` - WordPress Coding Standards for PHP_CodeSniffer
- `phpcompatibility/phpcompatibility-wp` - PHP version compatibility checker
- `phpcsstandards/phpcsutils` - Utilities for PHP_CodeSniffer
- `dealerdirect/phpcodesniffer-composer-installer` - Automatic installation of coding standards

### Default Configurations
- **Babel**: React and modern JavaScript support
- **ESLint**: WordPress coding standards
- **Stylelint**: SCSS linting with WordPress standards
- **Webpack**: Optimized for WordPress block development and theme builds

### Default SASS Include Paths
- `.` - Allow imports like: `@import 'node_modules/@fortawesome/...'`
- `./node_modules` - Allow imports like: `@import '@fortawesome/...'`
- `./node_modules/normalize-scss/sass`
- `./node_modules/mathsass/dist/`
- `./node_modules/@bostonuniversity`

## CLI Commands

The `bu-build` CLI provides all common build commands:

### Development
- `bu-build start` - Start development mode with watch (auto-detects and compiles theme.json if `src/theme-json/` exists)
- `bu-build watch:scripts` - Watch and build scripts only (with filtered output)
- `bu-build watch:theme-json` - Watch and compile theme.json only
- `bu-build watch:verbose` - Watch with full webpack output

### Building
- `bu-build build` - Production build (auto-detects theme.json, runs i18n, version update)
- `bu-build build:scripts` - Build scripts only (with filtered output)
- `bu-build build:theme-json` - Compile theme.json only
- `bu-build build:verbose` - Build with full webpack output
- `bu-build build:version` - Update version in style.css and theme.css
- `bu-build build:i18n` - Build internationalization files (clean, addtextdomain, makepot)
- `bu-build build:clean` - Clean language files
- `bu-build build:wpi18n` - Add text domain to PHP files
- `bu-build build:wpmakepot` - Generate POT file

### Linting
- `bu-build lint` - Run all linters (CSS, JS, Markdown, package.json, PHP)
- `bu-build lint:css` - Lint CSS/SCSS
- `bu-build lint:js` - Lint JavaScript
- `bu-build lint:js:fix` - Fix JavaScript linting issues (ignores `/dev/` folder)
- `bu-build lint:md` - Lint Markdown
- `bu-build lint:pkg` - Lint package.json
- `bu-build lint:php` - Lint modified PHP files (uses phpcbf + phpcs)
- `bu-build lint:php:all` - Lint all PHP files (not just modified)

### Testing
- `bu-build test:e2e` - Run end-to-end tests
- `bu-build test:unit` - Run unit tests

### Other
- `bu-build format` - Format code with Prettier
- `bu-build check-engines` - Check Node/npm versions match requirements
- `bu-build check-licenses` - Check dependency licenses

### Benefits of the CLI

1. **Filtered Output**: Build and watch commands automatically filter out verbose webpack stack traces
2. **Theme.json Compilation**: Automatically compiles modular theme.json files from `src/theme-json/`
3. **PHP Linting**: Built-in phpcs integration with WordPress coding standards
4. **Parallel Execution**: Runs multiple tasks in parallel when appropriate (e.g., `watch:scripts` + `watch:theme-json`)
5. **Sequential Builds**: Runs build steps in the correct order
6. **Consistent Behavior**: Same commands work across all themes

## PHP Linting Setup

The toolkit includes PHP_CodeSniffer with WordPress Coding Standards. To use it:

### 1. Install Composer Dependencies

The toolkit's `composer.json` includes all necessary PHP linting dependencies. Install them:

```bash
cd node_modules/@bostonuniversity/bu-build-toolkit && composer install
```

Or add to your theme's `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "cd node_modules/@bostonuniversity/bu-build-toolkit && composer install"
  }
}
```

### 2. Create `.phpcs.xml.dist`

Create a minimal config file in your theme root that extends the toolkit's base standards:

```xml
<?xml version="1.0"?>
<ruleset name="My Theme PHP Standards">
	<!-- Extend BU base standards from the toolkit -->
	<rule ref="./node_modules/@bostonuniversity/bu-build-toolkit/config/.phpcs.xml.dist"/>

	<!-- Theme-specific prefix configuration -->
	<rule ref="WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedNamespaceFound">
		<properties>
			<property name="prefixes" type="array">
				<element value="BU\MyTheme"/>
			</property>
		</properties>
	</rule>

	<rule ref="WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound">
		<properties>
			<property name="prefixes" type="array">
				<element value="MY_THEME"/>
			</property>
		</properties>
	</rule>

	<rule ref="WordPress.WP.I18n">
		<properties>
			<property name="text_domain" type="array" value="my-theme"/>
		</properties>
	</rule>
</ruleset>
```

### 3. Use the Commands

```bash
npm run lint:php        # Lint modified PHP files
npm run lint:php:all    # Lint all PHP files
npm run lint            # Lint everything (JS, CSS, PHP, etc.)
```

The PHP linter:
- Auto-fixes issues with `phpcbf` where possible
- Reports remaining issues with `phpcs`
- Checks WordPress coding standards
- Verifies PHP 7.4+ compatibility
- Validates text domain usage

## Migration from Theme-Based Configuration

If you're migrating from a theme that has its own build configuration:

1. **Install the toolkit**: `npm install --save-dev @bostonuniversity/bu-build-toolkit`

2. **Create webpack.config.js**: Copy your `themeEntryPoints` from `webpack.customizations.js` into the new format shown above

3. **Remove old dependencies**: You can remove these from your theme's package.json (they're now provided by the toolkit):
   - `@wordpress/scripts`
   - `@wordpress/stylelint-config`
   - `webpack-merge`
   - `webpack-remove-empty-scripts`
   - `sass-embedded` or `sass`
   - `npm-run-all`
   - `nodemon`
   - `rimraf`
   - `node-wp-i18n`
   
4. **Simplify PHP linting**: Remove your theme's `composer.json` and replace with toolkit's version:
   - Use `postinstall` to install toolkit's composer dependencies
   - Create minimal `.phpcs.xml.dist` extending toolkit's base (see PHP Linting Setup above)
   - Remove `dev/phpcs/lint-*.sh` scripts (now in toolkit as `bu-build lint:php`)

5. **Update scripts**: Replace theme-specific scripts with `bu-build` commands in package.json

6. **Test**: Run `npm run build` and `npm run start` to verify everything works

## Troubleshooting

### Error Messages in the Terminal

Webpack can produce very long error messages and logging at times. This toolkit attempts to reduce the
amount that is output but occassionally large amounts of source code will be output to the terminal when
a build error occurs. The default Terminal scroll buffer or scrollback setting might not be large enough
and you may see the terminal output be overridden. 

This can mean you don't see the entire error message as it has been replaced with source code of limited 
utility. 

You can make this better by editing the settings for the terminal scrollback or buffer in your IDE or 
Terminal app so you can scroll back and see the entire output from Webpack. 

See: [VSCode Terminal Buffer Setting](https://code.visualstudio.com/docs/terminal/basics#_navigating-the-buffer)

### SASS Include Paths Not Working

Ensure you're passing `loadPaths` correctly in your config, or use the theme's `node_modules` path.

**Note:** sass-loader v16+ uses `loadPaths` (modern API) instead of `includePaths` (legacy API).

### Blocks Not Building

The toolkit automatically detects blocks via `block.json` files. Ensure your blocks follow the standard WordPress block structure.

### Build Performance

The toolkit uses `sass-embedded` by default for faster builds on macOS. If you experience issues, switch to `sass` via the `sassCompiler` option.
