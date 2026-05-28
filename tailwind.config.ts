import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdaff",
          300: "#8ec3ff",
          400: "#5aa3ff",
          500: "#3585ff",
          600: "#2167e6",
          700: "#1c54c2",
          800: "#1c4799",
          900: "#1c3e7a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
