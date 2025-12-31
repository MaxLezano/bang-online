/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    cyan: '#00ffff',
                    magenta: '#ff00ff',
                    green: '#39ff14',
                    gold: '#ffd700',
                }
            },
            boxShadow: {
                'neon-cyan': '0 0 10px #00ffff',
                'neon-magenta': '0 0 10px #ff00ff',
                'neon-green': '0 0 10px #39ff14',
                'neon-gold': '0 0 10px #ffd700',
            }
        },
    },
    plugins: [],
}
