/**
 * SVGO Configuration
 *
 * SVGR is used by @wordpress/scripts when compiling to handle SVG in React.
 * This configuration file customizes SVGR behavior for BU themes and plugins.
 *
 * Issue:
 * By default, SVGR enables the SVGO plugin to optimize SVG files. One feature
 * that causes issues is prefixing IDs and class names with the file name to
 * reduce collisions. This is not desirable when using the same SVG in both
 * React components and PHP templates, as the classes will differ.
 *
 * Solution:
 * This configuration disables the prefix feature of SVGO, ensuring consistent
 * class names and IDs across different contexts.
 *
 * @see https://github.com/gregberge/svgr/issues/906
 * @see https://react-svgr.com/docs/options/#svgo
 */

module.exports = {
	plugins: [
		{
			name: 'prefixIds',
			params: {
				prefixIds: false,
				prefixClassNames: false,
			},
		},
	],
};
