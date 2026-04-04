export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgSecondary: "var(--bg-secondary)",
        border: "var(--border)",
        accentPrimary: "var(--accent-primary)",
        accentSecondary: "var(--accent-secondary)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.2)',
      },
    },
  },
  plugins: [],
}
