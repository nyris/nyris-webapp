// tailwind.config.js
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      boxShadow: {
        outer: "0 0 16px 0 rgba(202, 202, 209, 0.5)",
        outer200: "0 0 16px 0 rgba(170, 171, 181, 0.5)",
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
          "0%, 100%": {
            color: "transparent",
            backgroundImage:
              "linear-gradient(90deg, rgba(62, 54, 220, 1) 0%, rgba(227, 27, 93, 1) 100%);",
            backgroundClip: "text",
            opacity: 1,
          },
          "50%": {
            color: "rgba(170, 171, 181)",
            backgroundClip: "text",
            opacity: 0.4,
          },
        },
      },

      animation: {
        slideUp: "slideUp 0.3s linear",
        slideDown: "slideDown 0.3s linear",
        loadingTextColor:
          "loadingTextColor 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        primary: "#2B2C46",
        secondary: "#3E36DC",
      },
    },
  },
  plugins: [],
};
