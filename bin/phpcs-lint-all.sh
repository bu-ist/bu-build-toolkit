#!/usr/bin/env bash

##
# Lint All PHP Files
#
# Runs PHPCS on all PHP files in the current directory.
# Uses phpcbf to auto-fix issues, then phpcs to report remaining issues.
#
# Usage: bu-build lint:php:all
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

# Find all PHP files
phpfiles=$(find . -name '*.php' \
	-not -path '*/node_modules/*' \
	-not -path '*/vendor/*' \
	-not -path '*/build/*' \
	-not -path '*/dev/*' \
	-not -name '*.asset.php')

if [ ! -z "$phpfiles" ]
then
	echo "Running phpcbf (auto-fix)..."
	$PHPCBF --colors --extensions=php $phpfiles || true
	
	echo ""
	echo "Running phpcs (report)..."
	$PHPCS --colors --extensions=php $phpfiles
else
	echo "No PHP files found to lint."
fi
