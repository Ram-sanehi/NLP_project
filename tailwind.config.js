/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#0d1117',
        'chat-sidebar': '#161b22',
        'chat-bubble-user': '#1f6feb',
        'chat-bubble-bot': '#21262d',
        'chat-input': '#21262d',
        'chat-border': '#30363d',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
