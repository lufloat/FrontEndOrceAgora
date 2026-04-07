export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1A56DB", light: "#DBEAFE", dark: "#1E40AF" },
        surface: "#F8FAFC",
        muted: "#64748B",
      },
    },
  },
  plugins: [],
}