/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'proneo-green': '#00FF00',
                'proneo-dark': '#0A0A0A',
            }
        },
    },
    plugins: [],
}
