import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Avoid clashing with other Vite apps (default 5173) when Netlify proxies to targetPort
    host: '127.0.0.1',
    port: 5199,
    strictPort: true,
  },
})
