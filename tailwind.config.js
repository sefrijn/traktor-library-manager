module.exports = {
  purge: { content: ["./public/**/*.html", "./src/**/*.vue"] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ["Mulish", "ui-sans-serif", "system-ui"],
    },
    extend: {
      colors: {
        "black-very-light": "#343434",
        "black-light": "#2d2d2d",
        "black-medium": "#1c1c1c",
        "black-dark": "#131313",
        "gray-dark": "#777777",
        gray: "#969696",
        "gray-light": "#A0A0A0",
        "gray-very-light": "#C5C5C5",
        "active-light": "#A7F3FF",
        active: "#2e91a7",
        "active-dark": "#007f93",
        "active-very-dark": "#255571",
        "active-orange": "#F3980C",
      },
      transitionProperty: {
        width: "width",
        height: "height",
      },
      boxShadow: {
        black: "0 0 3px 1px rgba(0, 0, 0, 0.25)",
        "black-lg": "0 0 6px 3px rgba(0, 0, 0, 0.25)",
      },
      fontSize: {
        xxs: ".6rem",
      },
      cursor: { "divider-h": "col-resize" },
      animation: {
        "pulse-fast": "pulse 0.55s linear infinite",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["checked"],
      textColor: ["checked"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
