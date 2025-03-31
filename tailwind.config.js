/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Novo Nordisk brand colors
        'novo-red': '#db0032',
        'novo-blue': '#0066a4',
        'novo-teal': '#00a0af',
        'novo-green': '#00843d',
        'novo-amber': '#ffc72c',
        'novo-danger': '#c8102e',
        'novo-dark': '#212529',
        'novo-light': '#6c757d',
        'novo-border': '#e9ecef',
        'novo-background': '#f8f9fa',
      },
      fontFamily: {
        sans: ['Inter', 'Neue Haas Grotesk', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
} 