/**
 * Theme.json Settings
 *
 * Global settings for colors, typography, spacing, and other theme features.
 * 
 * @see https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/#settings
 * @see https://developer.bu.edu/gutenberg/best-practices/bu-child-starter/theme-json/
 */
export default {
	settings: {
		border: {
			customRadius: true,
		},
		color: {
			custom: true,
			customDuotone: true,
			customGradient: true,
			link: true,
			palette: [
				{
					name: 'BU Red',
					slug: 'theme-color-bu',
					color: 'var(--theme-color-bu,#c00)',
				},
				{
					name: 'Light',
					slug: 'theme-color-light',
					color: 'var(--theme-color-light,#F4F6F8)',
				},
				{
					name: 'Dark',
					slug: 'theme-color-dark',
					color: 'var(--theme-color-dark,#292929)',
				},
			],
		},
		typography: {
			customFontSize: true,
			fontSizes: [
				{
					name: 'Small',
					slug: 'small',
					size: '0.875rem',
				},
				{
					name: 'Medium',
					slug: 'medium',
					size: '1rem',
				},
				{
					name: 'Large',
					slug: 'large',
					size: '1.5rem',
				},
			],
		},
		spacing: {
			units: [ 'px', 'em', 'rem', 'vh', 'vw', '%' ],
		},
	},
};
