/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
      },
      colors: {
        'myconfort': {
          green: '#477A0C',
          cream: '#F2EFE2',
          coral: '#F55D3E',
          blue: '#89BBFE',
          purple: '#D68FD6',
          dark: '#14281D'
        }
      },
      boxShadow: {
        'custom': '0_10px_25px_-5px_rgba(0,0,0,0.3)',
        'custom-hover': '0_15px_30px_-5px_rgba(0,0,0,0.4)',
        'button': '5px_5px_0px_0px_rgba(0,0,0,0.3)',
        'button-hover': '7px_7px_0px_0px_rgba(0,0,0,0.3)'
      }
    },
  },
  plugins: [],
};
