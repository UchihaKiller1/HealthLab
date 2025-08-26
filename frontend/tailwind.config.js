/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: '#75A64D',
				secondary: '#DBE4D3',
				accent: '#2C5835',
			},
			fontFamily: {
				champ: ['"Champ-Black"', 'Anton', 'sans-serif'],
				sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				card: '0 10px 20px rgba(0,0,0,0.06), 0 6px 6px rgba(0,0,0,0.05)'
			}
		},
	},
	plugins: [],
};
