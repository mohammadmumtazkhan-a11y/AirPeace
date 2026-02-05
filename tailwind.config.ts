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
                airpeace: {
                    navy: "#003366",
                    red: "#C8102E",
                    blue: "#0066CC",
                    lightBlue: "#E8F4FC",
                },
                mito: {
                    primary: "#6366F1",
                    secondary: "#8B5CF6",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
