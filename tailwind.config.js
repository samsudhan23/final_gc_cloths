/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
    darkMode: ['selector', '[class="app-dark"]'],
    content: ['./src/**/*.{html,ts,scss,css}', './index.html'],
    plugins: [PrimeUI],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        },
        extend: {
            colors: {
                theme: {
                    bg: "#111111",
                    text: "#ffffff",
                    muted: "#b3b3b3",
                    accent: "#e91e63",
                    accentHover: "#ff4d7d",
                }
            }
        }
    }
};
