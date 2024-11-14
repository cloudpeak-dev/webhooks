/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "rgba(255, 255, 255, 0.87)",
        background: "#363636",
      },
    },
  },
  plugins: [],
};
