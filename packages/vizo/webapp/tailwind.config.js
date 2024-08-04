// tailwind.config.js
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      boxShadow: {
        outer: "0 0 16px 0 rgba(202, 202, 209, 0.5)",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": {
            transform: "translateY(0)",
          },
          "100%": { transform: "translateY(100%)" },
        },
        loadingTextColor: {
          "0%, 100%": { color: "#1f2937" }, // Gray color
          "50%": { color: "#3b82f6" }, // Blue color
        },
      },

      animation: {
        slideUp: "slideUp 0.3s linear",
        slideDown: "slideDown 0.3s linear",
        loadingTextColor: "loadingTextColor 2s infinite",
      },
      colors: {
        primary: "#2B2C46",
        secondary: "#3E36DC",
      },
    },
  },
  plugins: [],
};
