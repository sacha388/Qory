import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'primary': '#050506',
        'surface': '#101113',
        'elevated': '#181A1F',
        
        // Brand
        'brand': {
          DEFAULT: '#4BA7F5',
          light: '#8CCAFF',
        },
        
        // CTA
        'cta': {
          DEFAULT: '#4BA7F5',
          hover: '#6BB8FF',
        },
        
        // States
        'info': '#5AC8FA',
        'success': '#34C759',
        'warning': '#FF9F0A',
        'error': '#FF3B30',

        // Editorial palette
        'charcoal': '#141416',
        'paper': '#F7F4ED',
        'lime': '#69D33F',
        'sky': '#4BA7F5',
        'coral': '#F16B5D',
        'sun': '#F4B43A',
        'pink': '#F59AB3',
      },
      textColor: {
        'primary': '#1D1D1F',
        'secondary': '#4B5563',
        'tertiary': '#8A919D',
      },
    },
  },
  plugins: [],
};
export default config;
