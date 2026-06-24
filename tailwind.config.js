const config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
    corePlugins: {
        preflight: false
    },
    important: '#__next',
    plugins: [require('tailwindcss-logical'), require('./src/@core/tailwind/plugin')],
    theme: {
        extend: {
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                'marquee-left': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                'marquee-right': {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'marquee-vertical': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-50%)' },
                },
                'drift-left': {
                    '0%, 100%': { transform: 'translateX(-5%)' },
                    '50%': { transform: 'translateX(-15%)' },
                },
                'drift-right': {
                    '0%, 100%': { transform: 'translateX(5%)' },
                    '50%': { transform: 'translateX(15%)' },
                }
            },
            animation: {
                marquee: 'marquee 20s linear infinite',
                'marquee-left': 'marquee-left 25s linear infinite',
                'marquee-right': 'marquee-right 25s linear infinite',
                'marquee-vertical': 'marquee-vertical 20s linear infinite',
                'drift-left': 'drift-left 15s ease-in-out infinite',
                'drift-right': 'drift-right 15s ease-in-out infinite',
            }
        }
    }
};
export default config;
