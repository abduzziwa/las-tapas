import { Comfortaa } from "next/font/google";
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontSize: {
                base: ['10px', '1rem'],
            },
            fontFamily: {
                Comfortaa: "Comfortaa",
            },
            colors: {
                main: "#F95E07",
                maingreen: "#22C536",
                mainred: "#EF4443",
                gradientEnd: "#DB8555",
                textcolor: "#464646",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "custom-gradient": "linear-gradient(86deg, #F95E07 27.38%, #DB8555 72.62%)",
            },
        },
    },
    plugins: [],
};

export default config;
