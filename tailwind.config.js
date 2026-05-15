/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          bg:       '#0f0f0f',
          surface:  '#1a1a1a',
          panel:    '#141414',
          border:   '#2a2a2a',
          accent:   '#f59e0b',
          accent2:  '#3b82f6',
          muted:    '#6b7280',
          text:     '#e5e7eb',
          textDim:  '#9ca3af',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.05)',
        glow:  '0 0 20px rgba(245,158,11,0.15)',
      },
    },
  },
  plugins: [],
}
