#!/usr/bin/env bash

##
# Lint Modified PHP Files
#
# Runs PHPCS only on PHP files that are modified or untracked in git.
# Uses phpcbf to auto-fix issues, then phpcs to report remaining issues.
#
# Usage: bu-build lint:php
##

# Find the vendor/bin directory (could be in theme or in toolkit's node_modules)
if [ -f "./vendor/bin/phpcs" ]; then
	PHPCS="./vendor/bin/phpcs"
	PHPCBF="./vendor/bin/phpcbf"
elif [ -f "./node_modules/@bostonuniversity/bu-build-toolkit/vendor/bin/phpcs" ]; then
	PHPCS="./node_modules/@bostonuniversity/bu-build-toolkit/vendor/bin/phpcs"
	PHPCBF="./node_modules/@bostonuniversity/bu-build-toolkit/vendor/bin/phpcbf"
else
	echo "Error: phpcs not found. Run 'composer install' first."
	exit 1
fi

# Get modified and untracked PHP files from git, excluding build artifacts
phpfiles=$(git ls-files -om --exclude-standard '*.php' '**/*.php' ':!:*.asset.php' ':!:build/*' ':!:dev/*' ':!:vendor/*' ':!:node_modules/*')

if [ ! -z "$phpfiles" ]
then
	echo "Running phpcbf (auto-fix) on modified files..."
	$PHPCBF --colors --extensions=php $phpfiles || true
	
	echo ""
	echo "Running phpcs (report) on modified files..."
	$PHPCS --colors --extensions=php $phpfiles
else
	echo "No modified PHP files found to lint."
fi
