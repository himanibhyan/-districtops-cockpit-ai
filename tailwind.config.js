/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#f8fafc',
          sidebar: '#0b1120',
          sidebarCard: '#151f32',
          sidebarBorder: '#1e293b',
          sidebarHover: '#1e293b',
          accent: '#2563eb',
          accentHover: '#1d4ed8',
          card: '#ffffff',
          border: '#e2e8f0',
          textMuted: '#64748b',
          textDark: '#0f172a',
          warning: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
          info: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
