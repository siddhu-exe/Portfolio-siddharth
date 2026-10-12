/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F1ED',
        ink: '#171717',
        terracotta: '#D9834A',
        mustard: '#FFE862',
        // Project Shelf: warmer paper tone + brick accent
        paper: '#F3EEE6',
        brick: '#B5533C',
        // Home hero: menu-pill yellow, warm text greys, status green, panel accent
        sun: '#FFE14D',
        umber: { DEFAULT: '#4A433C', mid: '#5A524B', soft: '#6F665E' },
        moss: '#3F8A5A',
        sand: '#E8B48C',
        // Toolbox browns — deep matte espresso + walnut panel
        bark: '#1B1109',
        barklight: '#2B1A0E',
        wood: '#6D4A30',
        tan: '#C7A079',
      },
      fontFamily: {
        sans: ['"General Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        grotesk: ['"Schibsted Grotesk"', '"General Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        headline: '-0.03em',
      },
    },
  },
  plugins: [],
};
