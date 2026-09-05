/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        mist: "#eff6ff",
        accent: "#f97316",
        teal: "#14b8a6",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(8, 17, 31, 0.22)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(249,115,22,0.34), transparent 32%), radial-gradient(circle at top right, rgba(20,184,166,0.25), transparent 28%), linear-gradient(135deg, #08111f 0%, #10223d 55%, #0b1628 100%)",
      },
    },
  },
  plugins: [],
};
