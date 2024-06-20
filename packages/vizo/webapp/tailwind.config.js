// tailwind.config.js
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      boxShadow: {
        outer: "0 0 16px 0 rgba(202, 202, 209, 0.5)",
      },
    },
  },
  plugins: [],
};
