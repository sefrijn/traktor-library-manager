module.exports = {
  purge: { content: ["./public/**/*.html", "./src/**/*.vue"] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "black-light": "#2d2d2d",
        "black-medium": "#1c1c1c",
        "black-dark": "#131313",
        gray: "#969696",
        "gray-light": "#A0A0A0",
        active: "#2e91a7",
        "active-dark": "#007f93",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
