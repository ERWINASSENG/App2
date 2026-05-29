module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,scss,css}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0657f9",
        "primary-glow": "#3b82f6",
        "background-light": "#f5f6f8",
        "background-dark": "#0f1623",
        "card-dark": "#182135",
        "accent-cyan": "#00d4ff",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"]
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at center, #1e293b 0%, #0f1623 70%)',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e293b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'neon': '0 0 20px rgba(6, 87, 249, 0.5)',
        'neon-sm': '0 0 10px rgba(6, 87, 249, 0.3)',
        '3d': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(6, 87, 249, 0.1)',
      }
    },
  },
  plugins: [],
  darkMode: "class",
}
