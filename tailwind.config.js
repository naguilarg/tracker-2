/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode manually class-based
  theme: {
    extend: {
      colors: {
        // We will add custom colors here later if needed
        background: '#09090b', // zinc-950 for deep dark background
        foreground: '#fafafa', // zinc-50 for high contrast text
        card: '#18181b', // zinc-900 for cards
        'card-foreground': '#fafafa',
        primary: '#fafafa',
        'primary-foreground': '#18181b',
        secondary: '#27272a', // zinc-800
        'secondary-foreground': '#fafafa',
        muted: '#27272a',
        'muted-foreground': '#a1a1aa', // zinc-400
        accent: '#27272a',
        'accent-foreground': '#fafafa',
        destructive: '#ef4444', // red-500
        'destructive-foreground': '#fafafa',
        border: '#27272a',
        input: '#27272a',
        ring: '#d4d4d8', // zinc-300
      },
    },
  },
  plugins: [],
}
