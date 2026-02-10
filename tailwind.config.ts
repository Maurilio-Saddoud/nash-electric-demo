import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#ED1C24",
          white: "#FFFFFF",
          blue: "#0D4B93"
        }
      },
      boxShadow: {
        card: "0 10px 24px rgba(13, 75, 147, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
