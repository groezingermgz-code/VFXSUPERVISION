import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Erlaubte Tunneldomains für den Dev-Server (Vite 5+ Host-Check)
    allowedHosts: [
      'vfx-supervision.loca.lt',
      'twelve-ducks-drum.loca.lt'
    ],
    hmr: {
      overlay: false
    }
  }
})